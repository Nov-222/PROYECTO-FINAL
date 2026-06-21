import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchScreeningSeats, lockScreeningSeats, type Seat } from '../features/catalog/catalogApi';

export const SeatSelectionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [lockTimer, setLockTimer] = useState<number | null>(null);

  const totalRequestedTickets = Array.from(new URLSearchParams(location.search).values())
    .reduce((sum, val) => sum + parseInt(val), 0) || 1; 

  const loadSeats = async () => {
    try {
      if (!id) return;
      const data = await fetchScreeningSeats(id);
      setSeats(data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Error al cargar el mapa de butacas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSeats(); }, [id]);

  useEffect(() => {
    if (lockTimer === null || lockTimer <= 0) return;
    const interval = setInterval(() => setLockTimer(t => (t ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [lockTimer]);

  const toggleSeat = (seat: Seat) => {
    if (seat.status !== 'available' || seat.type === 'corridor') return;

    const isSelected = selectedSeats.some(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      const maxAllowed = Math.min(totalRequestedTickets, 8);
      if (selectedSeats.length >= maxAllowed) {
        alert(`Has alcanzado el límite de ${maxAllowed} entradas seleccionadas.`);
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  const handleLockSeats = async () => {
    try {
      setErrorMsg('');
      if (!id) return;
      const res = await lockScreeningSeats(id, selectedSeats.map(s => s.id));
      
      setLockTimer(res.expires_in_seconds);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(err.response.data.detail);
        setSelectedSeats([]);
        loadSeats(); 
      } else {
        setErrorMsg(err.response?.data?.detail || 'Error en la reserva.');
      }
    }
  };

  if (isLoading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1115', color: '#f4e951', fontFamily: 'system-ui' }}>Dibujando sala...</div>;

  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f1115', color: '#fff', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      <div style={{ flex: '1', padding: '2rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>←</span> Volver a horarios
          </button>
        </div>

        <div style={{ width: '100%', maxWidth: '700px', height: '50px', borderTop: '6px solid #374151', borderRadius: '50% 50% 0 0', marginTop: '1rem', marginBottom: '5rem', display: 'flex', justifyContent: 'center', paddingTop: '15px', color: '#4b5563', letterSpacing: '10px', fontWeight: '900', fontSize: '1.2rem' }}>
          PANTALLA
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {rows.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              
              <div style={{ width: '30px', fontWeight: 'bold', color: '#6b7280', textAlign: 'center' }}>{row}</div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                {seats.filter(s => s.row === row).sort((a, b) => a.col - b.col).map(seat => {
                  
                  if (seat.type === 'corridor') return <div key={seat.id} style={{ width: '35px', height: '35px' }} />;

                  const isSelected = selectedSeats.some(s => s.id === seat.id);
                  let bgColor = '#1f222b'; 
                  let borderColor = '#374151';
                  let cursor = 'pointer';

                  if (seat.status === 'locked' || seat.status === 'sold') {
                    bgColor = '#374151'; 
                    borderColor = '#1f222b';
                    cursor = 'not-allowed';
                  } else if (isSelected) {
                    bgColor = '#f4e951'; 
                    borderColor = '#d4c942';
                  } else if (seat.type === 'vip') {
                    borderColor = '#3b82f6';
                  } else if (seat.type === 'wheelchair') {
                    borderColor = '#8b5cf6'; 
                  }

                  return (
                    <div
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      style={{
                        width: '35px', height: '35px', backgroundColor: bgColor, border: `2px solid ${borderColor}`,
                        borderRadius: '8px 8px 4px 4px', cursor: cursor, display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: isSelected ? '#000' : (seat.status === 'available' ? '#9ca3af' : '#1f222b'),
                        fontWeight: 'bold', fontSize: '0.8rem', transition: 'all 0.2s'
                      }}
                      title={`${row}${seat.col} - ${seat.type}`}
                    >
                      {seat.status !== 'available' ? '×' : seat.col}
                    </div>
                  );
                })}
              </div>

              <div style={{ width: '30px', fontWeight: 'bold', color: '#6b7280', textAlign: 'center' }}>{row}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '4rem', padding: '1.5rem 3rem', backgroundColor: '#171a21', borderRadius: '30px', border: '1px solid #262932', fontSize: '0.9rem', color: '#9ca3af', fontWeight: '600' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '18px', height: '18px', backgroundColor: '#1f222b', border: '2px solid #374151', borderRadius: '4px' }}></div> Disponible</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '18px', height: '18px', backgroundColor: '#f4e951', borderRadius: '4px' }}></div> Seleccionado</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '18px', height: '18px', backgroundColor: '#374151', borderRadius: '4px' }}></div> Ocupado</div>
        </div>
      </div>

      <div style={{ width: '400px', backgroundColor: '#171a21', borderLeft: '1px solid #262932', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.3)' }}>
        
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', marginBottom: '2rem', letterSpacing: '0.5px' }}>TUS BUTACAS</h2>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', borderBottom: '1px solid #262932', paddingBottom: '1rem', marginBottom: '1.5rem', fontWeight: '600' }}>
          <span>Seleccionadas</span>
          <strong style={{ color: '#fff' }}>{selectedSeats.length} de {totalRequestedTickets}</strong>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '80px', marginBottom: '2rem' }}>
          {selectedSeats.length > 0 ? selectedSeats.map(s => (
            <span key={s.id} style={{ backgroundColor: '#262932', color: '#f4e951', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '900', fontSize: '1.1rem', border: '1px solid #374151' }}>
              {s.row}{s.col}
            </span>
          )) : (
            <p style={{ color: '#4b5563', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>Haz clic en el mapa para asignar asientos a tus boletos.</p>
          )}
        </div>

        {lockTimer !== null && lockTimer > 0 && (
          <div style={{ backgroundColor: 'rgba(244, 233, 81, 0.05)', border: '1px dashed #f4e951', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ display: 'block', color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '700' }}>Tu reserva expira en</span>
            <strong style={{ color: '#f4e951', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '2px' }}>
              {Math.floor(lockTimer / 60)}:{(lockTimer % 60).toString().padStart(2, '0')}
            </strong>
          </div>
        )}

        {lockTimer === 0 && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: 'bold' }}>
            Tu reserva ha expirado. Vuelve a intentarlo.
          </div>
        )}

        <div style={{ marginTop: 'auto' }}>
          <button 
            onClick={handleLockSeats}
            disabled={selectedSeats.length !== totalRequestedTickets || (lockTimer !== null && lockTimer > 0)}
            style={{
              width: '100%', padding: '1.25rem', borderRadius: '8px', border: 'none', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem',
              backgroundColor: (selectedSeats.length === totalRequestedTickets && (!lockTimer || lockTimer <= 0)) ? '#f4e951' : '#262932',
              color: (selectedSeats.length === totalRequestedTickets && (!lockTimer || lockTimer <= 0)) ? '#0f1115' : '#4b5563',
              cursor: (selectedSeats.length === totalRequestedTickets && (!lockTimer || lockTimer <= 0)) ? 'pointer' : 'not-allowed',
              transition: 'background-color 0.2s'
            }}
          >
            {lockTimer && lockTimer > 0 ? 'Reserva Confirmada' : 'Confirmar Reserva'}
          </button>
        </div>

      </div>
    </div>
  );
};