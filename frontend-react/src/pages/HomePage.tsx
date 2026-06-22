import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeaturedHero } from '../features/catalog/components/FeaturedHero';
import { MovieCatalog } from '../features/catalog/components/MovieCatalog';
import { fetchRecommendations, type RecommendationResponse } from '../features/catalog/catalogApi';
import { useAuthStore } from '../shared/store/authStore';

export const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recs, setRecs] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    fetchRecommendations(user?.id)
      .then(setRecs)
      .catch(err => console.error("Error al cargar recomendaciones:", err));
  }, [user]);

  return (
    <div style={{ backgroundColor: '#0f1115', minHeight: '100vh', paddingBottom: '4rem' }}>
      <FeaturedHero />

      {recs && recs.items.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 4% 1rem', borderBottom: '1px solid #262932' }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>
            {recs.title}
          </h2>
          {recs.subtitle && (
            <p style={{ color: '#9ca3af', margin: '0 0 1.5rem 0', fontSize: '1rem' }}>
              {recs.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}>
            {recs.items.map(item => (
              <div 
                key={`rec-${item.id}`} 
                onClick={() => navigate(`/movie/${item.id}`)} 
                style={{ minWidth: '220px', width: '220px', cursor: 'pointer', position: 'relative', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img 
                  src={item.poster_url} 
                  alt={item.title} 
                  style={{ width: '100%', height: '330px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #262932', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }} 
                />
                
                <div style={{ 
                  backgroundColor: recs.is_personalized ? 'rgba(244, 233, 81, 0.95)' : 'rgba(255, 255, 255, 0.9)', 
                  color: '#000', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', position: 'absolute', bottom: '-15px', left: '10px', right: '10px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', lineHeight: '1.2' 
                }}>
                  {item.reason}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ paddingTop: '2rem' }}>
        <MovieCatalog />
      </div>
    </div>
  );
};