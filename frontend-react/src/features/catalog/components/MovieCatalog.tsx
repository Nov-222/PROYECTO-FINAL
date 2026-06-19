import { useState, useEffect } from 'react';
import { fetchMovies, type Movie } from '../catalogApi';
import { MovieCard } from './MovieCard';
import { SkeletonCard } from './SkeletonCard';
import '../styles/Catalog.css';

export const MovieCatalog = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadMovies = async (pageNumber: number, isInitial: boolean = true) => {
    if (isInitial) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const data = await fetchMovies(pageNumber, 12);
      if (isInitial) {
        setMovies(data.items);
      } else {
        setMovies(prev => [...prev, ...data.items]);
      }
      setHasMore(data.page < data.pages);
    } catch (err: any) {
      console.error("[Internal Log] Error fetching catalog:", { timestamp: new Date(), error: err.message });
      setError("Error al cargar la cartelera.");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadMovies(1, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage, false);
  };

  if (error && movies.length === 0) {
    return (
      <div className="catalog-state">
        <h2 className="catalog-state__title">{error}</h2>
        <button className="catalog-state__btn" onClick={() => loadMovies(1, true)}>Reintentar</button>
      </div>
    );
  }

  if (!isLoading && movies.length === 0) {
    return (
      <div className="catalog-state">
        <h2 className="catalog-state__title">No hay películas en cartelera esta semana. ¡Volvé pronto!</h2>
      </div>
    );
  }

  return (
    <section className="catalog-section">
      <div className="catalog-header">
        <h2 className="catalog-header__title">Now Showing</h2>
        <div className="catalog-filters">
          <button className="catalog-filters__tab active">All</button>
          <button className="catalog-filters__tab">Action</button>
          <button className="catalog-filters__tab">Comedy</button>
          <button className="catalog-filters__tab">Sci-fi</button>
          <button className="catalog-filters__tab">Thriller</button>
        </div>
      </div>

      <div className="catalog-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}

        {(isLoading || isFetchingMore) && 
          Array.from({ length: isLoading ? 12 : 4 }).map((_, i) => (
            <SkeletonCard key={`skel-${i}`} />
          ))
        }
      </div>

      {hasMore && !isLoading && (
        <div className="catalog-footer">
          <button 
            className="catalog-footer__btn" 
            onClick={handleLoadMore} 
            disabled={isFetchingMore}
          >
            {isFetchingMore ? 'Cargando...' : 'Cargar Más'}
          </button>
        </div>
      )}
    </section>
  );
};