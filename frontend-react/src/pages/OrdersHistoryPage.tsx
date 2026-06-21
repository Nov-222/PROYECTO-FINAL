import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyOrders, type OrderHistoryItem } from '../features/catalog/catalogApi';
import { useAuthStore } from '../shared/store/authStore';

export const OrdersHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'tickets' | 'list'>('tickets');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/me/orders');
      return;
    }

    const loadOrders = async () => {
      try {
        const data = await fetchMyOrders(user.id);
        setOrders(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  const { upcomingOrders, pastOrders } = useMemo(() => {
    const now = new Date();
    const upcoming: OrderHistoryItem[] = [];
    const past: OrderHistoryItem[] = [];
    
    orders.forEach(order => {
      const screenTime = new Date(order.start_time);
      if (screenTime > now) upcoming.push(order);
      else past.push(order);
    });
    
    return { upcomingOrders: upcoming, pastOrders: past };
  }, [orders]);

  const handleDownloadTicket = (orderId: string) => {
    alert(`Descargando Entrada PDF (Orden: ${orderId})`);
  };
  const handleDownloadReceipt = (orderId: string) => {
    alert(`Descargando Factura/Comprobante PDF (Orden: ${orderId})`);
  };

  if (isLoading) return <div style={{ minHeight: '100vh', backgroundColor: '#0f1115', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#f4e951', fontFamily: 'system-ui' }}>Cargando tus entradas...</div>;

  return (
    <div style={{ backgroundColor: '#0f1115', minHeight: '100vh', color: '#ffffff', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        
        <div style={{ width: '260px', borderRight: '1px solid #262932', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f4e951', color: '#0f1115', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '900' }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800' }}>{user?.name}</h3>
              <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Miembro</span>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button onClick={() => setActiveTab('account')} style={{ background: activeTab === 'account' ? 'rgba(244, 233, 81, 0.1)' : 'transparent', color: activeTab === 'account' ? '#f4e951' : '#d1d5db', border: activeTab === 'account' ? '1px solid rgba(244, 233, 81, 0.2)' : '1px solid transparent', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>👤 Mi Cuenta</button>
            <button onClick={() => { setActiveTab('tickets'); setSelectedOrder(null); }} style={{ background: activeTab === 'tickets' ? 'rgba(244, 233, 81, 0.1)' : 'transparent', color: activeTab === 'tickets' ? '#f4e951' : '#d1d5db', border: activeTab === 'tickets' ? '1px solid rgba(244, 233, 81, 0.2)' : '1px solid transparent', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>🎟️ Mis Entradas</button>
            <button onClick={() => setActiveTab('list')} style={{ background: activeTab === 'list' ? 'rgba(244, 233, 81, 0.1)' : 'transparent', color: activeTab === 'list' ? '#f4e951' : '#d1d5db', border: activeTab === 'list' ? '1px solid rgba(244, 233, 81, 0.2)' : '1px solid transparent', padding: '1rem', borderRadius: '8px', textAlign: 'left', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>⭐ Mi Lista</button>
          </nav>
        </div>

        <div style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
          
          {activeTab !== 'tickets' ? (
            <div style={{ color: '#9ca3af' }}>Esta sección se implementará en el futuro.</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <div style={{ fontSize: '5rem', marginBottom: '1rem', opacity: 0.5 }}>🎬</div>
              <h2 style={{ fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>No tienes entradas aún</h2>
              <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>¡Descubre la magia del cine explorando nuestra cartelera!</p>
              <button onClick={() => navigate('/home')} style={{ backgroundColor: '#f4e951', color: '#0f1115', border: 'none', padding: '1rem 2rem', borderRadius: '30px', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer' }}>Explorar Cartelera</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
              
              <div style={{ flex: selectedOrder ? '1' : '100%', transition: 'all 0.3s ease' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '2rem' }}>Mis Entradas</h2>
                
                {upcomingOrders.length > 0 && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', borderBottom: '1px solid #262932', paddingBottom: '0.5rem' }}>Próximas Funciones</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {upcomingOrders.map(order => (
                        <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ display: 'flex', gap: '1.5rem', backgroundColor: selectedOrder?.id === order.id ? '#1f222b' : '#171a21', padding: '1.25rem', borderRadius: '12px', border: selectedOrder?.id === order.id ? '1px solid #f4e951' : '1px solid #262932', cursor: 'pointer', transition: 'all 0.2s' }}>
                          <img src={order.poster_url} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px' }} alt="Poster" />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: '800' }}>{order.movie_title}</h4>
                              <span style={{ backgroundColor: '#262932', color: '#f4e951', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>PROXIMO</span>
                            </div>
                            <p style={{ margin: '0 0 0.3rem', color: '#e5e7eb', fontSize: '0.9rem' }}>{new Date(order.start_time).toLocaleString('es-ES', { weekday:'short', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</p>
                            <p style={{ margin: '0 0 0.3rem', color: '#9ca3af', fontSize: '0.85rem' }}>{order.room_name} • Asientos: {order.seat_labels.join(', ')}</p>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem', fontFamily: 'monospace' }}>ORD: {order.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastOrders.length > 0 && (
                  <div>
                    <h3 style={{ color: '#9ca3af', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem', borderBottom: '1px solid #262932', paddingBottom: '0.5rem' }}>Historial de Compras</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {pastOrders.map(order => (
                        <div key={order.id} onClick={() => setSelectedOrder(order)} style={{ display: 'flex', gap: '1.5rem', backgroundColor: selectedOrder?.id === order.id ? '#1f222b' : '#171a21', padding: '1.25rem', borderRadius: '12px', border: selectedOrder?.id === order.id ? '1px solid #4b5563' : '1px solid #262932', cursor: 'pointer', transition: 'all 0.2s', opacity: 0.8 }}>
                          <img src={order.poster_url} style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '8px', filter: 'grayscale(100%)' }} alt="Poster" />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: '800' }}>{order.movie_title}</h4>
                              <span style={{ backgroundColor: '#262932', color: '#9ca3af', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>FINALIZADA</span>
                            </div>
                            <p style={{ margin: '0 0 0.3rem', color: '#9ca3af', fontSize: '0.9rem' }}>{new Date(order.start_time).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' })}</p>
                            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.75rem', fontFamily: 'monospace' }}>ORD: {order.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedOrder && (
                <div style={{ width: '450px', backgroundColor: '#171a21', borderRadius: '20px', border: '1px solid #262932', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0,0,0,0.3)' }}>
                  
                  <div style={{ position: 'relative', height: '180px' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${selectedOrder.poster_url})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.4)' }}></div>
                    <button onClick={() => setSelectedOrder(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{selectedOrder.movie_title}</h2>
                    </div>
                  </div>

                  <div style={{ padding: '2rem' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', width: 'fit-content', margin: '0 auto 2rem auto' }}>
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedOrder.id}`} alt="QR" style={{ width: '130px', height: '130px' }} />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ color: '#f4e951', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: '800' }}>Información de la Función</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#e5e7eb', fontSize: '0.95rem' }}>
                        <div><span style={{ color: '#9ca3af', display: 'block', fontSize: '0.8rem' }}>Fecha</span> {new Date(selectedOrder.start_time).toLocaleDateString('es-ES')}</div>
                        <div><span style={{ color: '#9ca3af', display: 'block', fontSize: '0.8rem' }}>Hora</span> {new Date(selectedOrder.start_time).toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})}</div>
                        <div><span style={{ color: '#9ca3af', display: 'block', fontSize: '0.8rem' }}>Sala</span> {selectedOrder.room_name}</div>
                        <div><span style={{ color: '#9ca3af', display: 'block', fontSize: '0.8rem' }}>Asientos ({selectedOrder.seat_labels.length})</span> <strong style={{ color: '#f4e951' }}>{selectedOrder.seat_labels.join(', ')}</strong></div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '2rem', backgroundColor: '#0f1115', padding: '1.5rem', borderRadius: '12px', border: '1px solid #262932' }}>
                      <h4 style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: '800' }}>Resumen de Pago</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e5e7eb', fontSize: '0.95rem', marginBottom: '0.5rem' }}><span>Estado</span> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{selectedOrder.status}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e5e7eb', fontSize: '0.95rem', marginBottom: '0.5rem' }}><span>Orden</span> <span style={{ fontFamily: 'monospace' }}>{selectedOrder.id}</span></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.2rem', fontWeight: '900', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #262932' }}>
                        <span>TOTAL</span>
                        <span>Bs. {selectedOrder.total_price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <button onClick={() => handleDownloadTicket(selectedOrder.id)} style={{ backgroundColor: '#f4e951', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}>Descargar Entradas (PDF)</button>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button onClick={() => handleDownloadReceipt(selectedOrder.id)} style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: '1px solid #4b5563', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Comprobante</button>
                        <button onClick={() => alert('Compartiendo...')} style={{ flex: 1, backgroundColor: 'transparent', color: '#fff', border: '1px solid #4b5563', padding: '0.8rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Compartir</button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};