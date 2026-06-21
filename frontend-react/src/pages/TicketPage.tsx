import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TicketPage = () => {
  const navigate = useNavigate();
  const [purchaseData, setPurchaseData] = useState<any>(null);

  useEffect(() => {
    const td = sessionStorage.getItem('ticketData');
    if (!td) { navigate('/home'); return; }
    setPurchaseData(JSON.parse(td));
    sessionStorage.removeItem('ticketData');
  }, [navigate]);

  if (!purchaseData) return null;

  const { data, res, seatIds, invoice } = purchaseData;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', color: '#ffffff', fontFamily: '"Inter", system-ui, sans-serif', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#14532d', color: '#4ade80', fontSize: '3rem', marginBottom: '1.5rem' }}>✓</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>¡Pago Exitoso!</h1>
        <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>Orden: <strong style={{ color: '#fff' }}>{res.order_id}</strong></p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', maxWidth: '1200px' }}>
        {res.tickets.map((t: any, index: number) => {
          const seatLabel = data.seats.find((s:any) => s.id === t.seat_id);
          return (
            <div key={index} style={{ width: '320px', backgroundColor: '#171a21', borderRadius: '16px', border: '1px solid #262932', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
              
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${data.movie.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', right: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0, textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{data.movie.title}</h3>
                </div>
              </div>

              <div style={{ padding: '1.5rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #374151', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Fecha</span>
                    <strong style={{ fontSize: '1rem' }}>{new Date(data.screening.start_time).toLocaleDateString('es-ES', { day:'numeric', month:'short' })}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Hora</span>
                    <strong style={{ fontSize: '1rem' }}>{new Date(data.screening.start_time).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Sala</span>
                    <strong style={{ fontSize: '1.2rem', color: '#f4e951' }}>{data.screening.room_name}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase' }}>Butaca</span>
                    <strong style={{ fontSize: '1.2rem', color: '#f4e951' }}>{seatLabel ? `${seatLabel.row}${seatLabel.col}` : 'N/A'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${t.qr_code}`} alt="QR Ticket" style={{ width: '120px', height: '120px' }} />
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace' }}>{t.qr_code}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '4rem' }}>
        <button onClick={() => window.print()} style={{ backgroundColor: '#374151', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Descargar PDF</button>
        <button onClick={() => navigate('/home')} style={{ backgroundColor: '#f4e951', color: '#000', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}>Volver al Inicio</button>
      </div>

    </div>
  );
};