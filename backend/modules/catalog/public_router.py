from fastapi import APIRouter, Query, HTTPException, Depends
from elasticsearch import Elasticsearch
import redis
import json
import os
from typing import Optional

from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from core.database import get_business_db 

router = APIRouter(prefix="/catalog", tags=["Public Catalog"])

ES_HOST = os.getenv("ELASTICSEARCH_URL", "http://elasticsearch:9200")
es = Elasticsearch(ES_HOST)

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
redis_client = redis.Redis(host=REDIS_HOST, port=6379, db=0, decode_responses=True)

@router.get("/movies")
def get_public_movies(
    page: int = Query(1, ge=1), 
    size: int = Query(12, ge=1, le=50),
    q: Optional[str] = Query(None, description="Término de búsqueda para título"),
    genre: Optional[str] = Query(None, description="Filtro exacto por nombre de género")
):
    cache_key = f"public_movies_p{page}_s{size}_q{q}_g{genre}"
    
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Redis Cache Miss/Error: {e}")

    try:
        if not es.indices.exists(index="movies"):
            return {"items": [], "total": 0, "page": page, "size": size, "pages": 0}

        from_val = (page - 1) * size
        must_clauses = []
        
        if q and len(q.strip()) >= 2:
            must_clauses.append({
                "multi_match": {
                    "query": q,
                    "fields": ["title^3", "director"], 
                    "type": "phrase_prefix" 
                }
            })
            
        if genre:
            must_clauses.append({"match_phrase": {"genres": genre}})

        es_query = {"bool": {"must": must_clauses}} if must_clauses else {"match_all": {}}

        response = es.search(index="movies", body={
            "query": es_query,
            "from": from_val,
            "size": size,
            "sort": [{"release_date": {"order": "desc", "unmapped_type": "date"}}] 
        })
        
        hits = response['hits']['hits']
        total = response['hits']['total']['value']
        movies = [hit['_source'] for hit in hits]
        
        result = {
            "items": movies,
            "total": total,
            "page": page,
            "size": size,
            "pages": (total + size - 1) // size
        }
        
        if not q and not genre:
            try:
                redis_client.setex(cache_key, 300, json.dumps(result))
            except Exception:
                pass
            
        return result

    except Exception as e:
        print(f"Elasticsearch Error: {e}")
        raise HTTPException(status_code=500, detail="Error interno al buscar en la cartelera")
    
@router.get("/genres")
def get_public_genres(db: Session = Depends(get_business_db)): # <--- CAMBIO CLAVE AQUÍ
    try:
        result = db.execute(text("SELECT name FROM catalog_genre WHERE is_active = true ORDER BY name ASC"))
        genres = [row[0] for row in result]
        
        print(f"[DEBUG] Géneros encontrados en business_db: {genres}")
        return {"genres": genres}
        
    except Exception as e:
        db.rollback()
        print(f"[WARNING] Tabla catalog_genre no encontrada. Intentando recuperación dinámica...")
        try:
            inspector = inspect(db.get_bind())
            tables = inspector.get_table_names()
            genre_table = next((t for t in tables if 'genre' in t.lower() and 'film' not in t.lower()), None)
            
            if genre_table:
                print(f"[RECOVERY] Tabla de géneros encontrada como: {genre_table}")
                result = db.execute(text(f"SELECT name FROM {genre_table} WHERE is_active = true ORDER BY name ASC"))
                genres = [row[0] for row in result]
                return {"genres": genres}
            else:
                print("[CRITICAL] ¡No se encontró ninguna tabla de géneros en la business_db!")
                return {"genres": []}
                
        except Exception as recovery_error:
            print(f"[CRITICAL ERROR] Falló la recuperación: {recovery_error}")
            return {"genres": []}