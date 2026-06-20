import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchMovieScreenings, type MovieScreeningsResponse, type Screening } from '../features/catalog/catalogApi';
import { useAuthStore } from '../shared/store/authStore';

export const ScreeningSelectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [data, setData] = useState<MovieScreeningsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      try {
        if (!id) return;
        const result = await fetchMovieScreenings(id);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id]);

  const groupedScreenings = useMemo(() => {
    if (!data) return {};
    return data.screenings.reduce((acc, sc) => {
      const dateKey = new Date(sc.start_time).toLocaleDateString('es-ES', { 
        weekday: 'long', day: 'numeric', month: 'short' 
      }).toUpperCase();
      
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(sc);
      return acc;
    }, {} as Record<string, Screening[]>);
  }, [data]);

  const availableDates = Object.keys(groupedScreenings);

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const handleSelectTime = (screeningId: string) => {
    if (!user) {
        navigate(`/login?redirect=/booking/${screeningId}/seats`);
    } else {
        navigate(`/booking/${screeningId}/seats`); 
    }
  };

  if (isLoading) return <div style={{ height: '100vh', backgroundColor: '#0f1115', color: '#f4e951', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Cargando horarios...</div>;
  if (!data) return <div style={{ height: '100vh', backgroundColor: '#0f1115', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Película no encontrada.</div>;

  const { movie } = data;
  const screeningsForSelectedDate = groupedScreenings[selectedDate] || [];

  const groupedByFormat = screeningsForSelectedDate.reduce((acc, sc) => {
    const key = `${sc.format} • ${sc.language} • ${sc.room}`; // Agrupamos también por sala
    if (!acc[key]) acc[key] = [];
    acc[key].push(sc);
    return acc;
  }, {} as Record<string, Screening[]>);

  return (
    <div style={{ backgroundColor: '#0f1115', minHeight: '100vh', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      
      <header style={{ padding: '1rem 6%', borderBottom: '1px solid #262932', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#171a21', position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
          <span>←</span> Volver
        </button>
        <h2 style={{ color: '#f4e951', margin: 0, cursor: 'pointer' }} onClick={() => navigate('/home')}>CINEMAPLUS</h2>
        <div style={{ width: '60px' }}></div> {/* Spacer */}
      </header>

      <div style={{ backgroundColor: '#171a21', padding: '2rem 6%', display: 'flex', gap: '2rem', borderBottom: '1px solid #262932' }}>
         <img src={movie.poster_url} alt={movie.title} style={{ width: '120px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />
         <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', textTransform: 'uppercase' }}>{movie.title}</h1>
            <div style={{ display: 'flex', gap: '1rem', color: '#9ca3af', fontWeight: 'bold' }}>
               <span style={{ border: '1px solid #4b5563', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{movie.rating_classification}</span>
               <span>{Math.floor(movie.duration_minutes/60)}h {movie.duration_minutes%60}m</span>
            </div>
         </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 6%' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.8rem' }}>Elige el horario de tu función</h2>

        {availableDates.length > 0 ? (
          <>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {availableDates.map(date => (
                <button 
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    padding: '0.5rem 1rem 1rem', 
                    cursor: 'pointer', 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: selectedDate === date ? '#f4e951' : '#9ca3af',
                    borderBottom: selectedDate === date ? '3px solid #f4e951' : '3px solid transparent',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {date}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(groupedByFormat).map(([formatKey, screenings]) => {
                 const [format, language, room] = formatKey.split(' • ');
                 return (
                  <div key={formatKey} style={{ backgroundColor: '#171a21', padding: '1.5rem', borderRadius: '12px', border: '1px solid #262932' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h4 style={{ margin: '0 0 0.2rem 0', color: 'white', fontSize: '1.1rem' }}>{room}</h4>
                            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{format} • {language}</span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      {screenings.map(sc => (
                        <button 
                          key={sc.id} 
                          onClick={() => handleSelectTime(sc.id)}
                          style={{
                            backgroundColor: 'transparent', 
                            border: '1px solid #4b5563', 
                            color: 'white', 
                            padding: '0.8rem 2rem', 
                            borderRadius: '8px', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            cursor: 'pointer', 
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f4e951'; e.currentTarget.style.color = '#f4e951'; }}
                          onMouseOut={(e) => { e.currentTarget.style.borderColor = '#4b5563'; e.currentTarget.style.color = 'white'; }}
                        >
                          {new Date(sc.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  </div>
                 )
              })}
            </div>
          </>
        ) : (
          <p style={{ color: '#9ca3af' }}>No hay funciones disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
};