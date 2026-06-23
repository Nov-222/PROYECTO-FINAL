import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeaturedHero } from '../features/catalog/components/FeaturedHero';
import { MovieCatalog } from '../features/catalog/components/MovieCatalog';
import { fetchRecommendations, markNotInterested, type RecommendationResponse } from '../features/catalog/catalogApi';
import { useAuthStore } from '../shared/store/authStore';

export const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [recs, setRecs] = useState<RecommendationResponse | null>(null);
  
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecommendations(user?.id)
      .then(setRecs)
      .catch(err => console.error("Error al cargar recomendaciones:", err));
  }, [user]);

  const getShortReason = (longReason: string) => {
    if (longReason.includes('género que calificaste')) return '⭐ Por tu actividad';
    if (longReason.includes('Quiero ver')) return '🎬 Por tu Watchlist';
    if (longReason.includes('géneros favoritos')) return '🎭 Porque te gusta';
    if (longReason.includes('tendencia')) return '🔥 Tendencia';
    return 'Recomendada';
  };

  const scrollCarousel = (scrollOffset: number) => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: scrollOffset,
        behavior: 'smooth'
      });
    }
  };

  const handleDismiss = async (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    if (!user) return;
    
    setDismissedIds(prev => new Set(prev).add(movieId));
    
    try {
      await markNotInterested(movieId, user.id);
      
      setTimeout(() => {
        setRecs(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== movieId) } : prev);
      }, 400);
      
    } catch (err) {
      console.error("Error al descartar película", err);
      setDismissedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  };

  return (
    <div style={{ backgroundColor: '#0f1115', minHeight: '100vh', paddingBottom: '4rem' }}>
      <style>{`
        .recs-carousel {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .recs-carousel::-webkit-scrollbar {
          display: none;
        }
        .rec-card-container {
          min-width: 260px;
          width: 260px;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .rec-card-image-box {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #262932;
          box-shadow: 0 15px 35px rgba(0,0,0,0.6);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .rec-card-container:hover .rec-card-image-box {
          transform: translateY(-6px);
          border-color: #f4e951;
        }
        .rec-card-explanation-panel {
          background-color: rgba(23, 26, 33, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
          min-height: 85px;
          justify-content: center;
        }
      `}</style>

      <FeaturedHero />

      {recs && recs.items.length > 0 && (
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 4% 1rem', borderBottom: '1px solid #262932' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.5rem' }}>
            <div>
              <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {recs.title}
              </h2>
              {recs.subtitle && (
                <p style={{ color: '#9ca3af', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
                  {recs.subtitle}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => scrollCarousel(-280)}
                style={{
                  backgroundColor: '#171a21', border: '1px solid #374151', color: '#fff',
                  width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f4e951'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#374151'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              
              <button 
                onClick={() => scrollCarousel(280)}
                style={{
                  backgroundColor: '#171a21', border: '1px solid #374151', color: '#fff',
                  width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#f4e951'}
                onMouseOut={e => e.currentTarget.style.borderColor = '#374151'}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div 
            ref={carouselRef}
            className="recs-carousel"
            style={{ 
              display: 'flex', 
              gap: '1.75rem', 
              overflowX: 'auto', 
              paddingBottom: '2.5rem',
              paddingTop: '0.5rem'
            }}
          >
            {recs.items.map(item => {
              const isDismissed = dismissedIds.has(item.id);
              
              return (
                <div 
                  key={`rec-${item.id}`} 
                  onClick={() => navigate(`/movie/${item.id}`)} 
                  className="rec-card-container"
                  style={{ 
                    minWidth: isDismissed ? '0px' : '260px', 
                    width: isDismissed ? '0px' : '260px', 
                    opacity: isDismissed ? 0 : 1,
                    transform: isDismissed ? 'scale(0.8)' : 'scale(1)',
                    marginRight: isDismissed ? '-1.75rem' : '0',
                    overflow: isDismissed ? 'hidden' : 'visible'
                  }}
                >
                  
                  <div className="rec-card-image-box">
                    {user && (
                      <button 
                        onClick={(e) => handleDismiss(e, item.id)}
                        style={{
                          position: 'absolute', top: '12px', right: '10px', zIndex: 10,
                          backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', border: 'none', 
                          borderRadius: '50%', width: '32px', height: '32px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                          backdropFilter: 'blur(4px)', outline: 'none'
                        }}
                        onMouseOver={e => { e.currentTarget.style.backgroundColor = '#ef4444'; }}
                        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.65)'; }}
                      >
                        ✕
                      </button>
                    )}

                    <img 
                      src={item.poster_url} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  
                  <div className="rec-card-explanation-panel">
                    <span style={{ 
                      color: recs.is_personalized ? '#f4e951' : '#fff', 
                      fontSize: '0.8rem', 
                      fontWeight: '800', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.5px' 
                    }}>
                      {getShortReason(item.reason)}
                    </span>
                    <p style={{ 
                      margin: 0, 
                      color: '#9ca3af', 
                      fontSize: '0.82rem', 
                      lineHeight: '1.4', 
                      fontWeight: '500' 
                    }}>
                      {item.reason}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        </section>
      )}

      <div style={{ paddingTop: '2rem' }}>
        <MovieCatalog />
      </div>
    </div>
  );
};