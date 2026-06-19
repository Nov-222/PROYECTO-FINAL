import { useAuthStore } from '../shared/store/authStore';
import { MovieCatalog } from '../features/catalog/components/MovieCatalog';

export const HomePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ backgroundColor: '#16181f', minHeight: '100vh', color: 'white' }}>
      
      <header style={{ padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #2a2c36' }}>
        <h1 style={{ color: '#f4e951', margin: 0, fontSize: '1.5rem' }}>CinemaPlus</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Hola, {user?.name || 'Invitado'}</span>
          {user && (
            <button 
              onClick={logout} 
              style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '0.4rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Salir
            </button>
          )}
        </div>
      </header>

      <section style={{ 
        width: '100%', 
        height: '400px', 
        background: 'linear-gradient(to top, #16181f 0%, transparent 100%), url(https://via.placeholder.com/1500x500/2a2c36/FFFFFF?text=Featured+Movie+Hero+Banner) center/cover',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 5% 3rem'
      }}>
        <h2 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>MORTAL KOMBAT</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: '#f4e951', color: 'black', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Book Now</button>
          <button style={{ background: 'transparent', color: 'white', border: '2px solid white', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Watch Trailer</button>
        </div>
      </section>

      <MovieCatalog />

    </div>
  );
};