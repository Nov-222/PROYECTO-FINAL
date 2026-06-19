import { useAuthStore } from '../shared/store/authStore';
import { MovieCatalog } from '../features/catalog/components/MovieCatalog';

export const HomePage = () => {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ backgroundColor: '#16181f', minHeight: '100vh', color: 'white' }}>
      
      <header style={{ 
        padding: '1rem 5%', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #2a2c36',
        backgroundColor: '#1c1f2a'
      }}>
        <h1 style={{ color: '#f4e951', margin: 0, fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px' }}>
          CinemaPlus
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {user ? (
            <>
              <span style={{ fontSize: '0.95rem', color: '#e2e8f0' }}>Bienvenido, <strong>{user.name}</strong></span>
              <button 
                onClick={logout} 
                style={{ 
                  background: 'transparent', 
                  color: '#ff4d4d', 
                  border: '1px solid #ff4d4d', 
                  padding: '0.4rem 1.2rem', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,77,77,0.1)' }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <a 
              href="/login" 
              style={{ 
                color: '#16181f', 
                backgroundColor: '#f4e951', 
                padding: '0.5rem 1.5rem', 
                borderRadius: '6px', 
                textDecoration: 'none', 
                fontWeight: 'bold' 
              }}
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </header>

      <section style={{ 
        width: '100%', 
        height: '450px', 
        background: 'linear-gradient(to top, #16181f 0%, rgba(22,24,31,0.4) 50%, rgba(22,24,31,0.8) 100%), url(https://images.alphacoders.com/134/1343714.jpeg) center/cover center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 5% 4rem'
      }}>
        <span style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', width: 'fit-content', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          DESTACADA DE LA SEMANA
        </span>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', textShadow: '2px 4px 10px rgba(0,0,0,0.7)' }}>
          DUNAL: PARTE DOS
        </h2>
        <p style={{ maxWidth: '600px', color: '#cbd5e1', margin: '0 0 1.5rem 0', fontSize: '1rem', lineHeight: '1.5', textShadow: '1px 2px 4px rgba(0,0,0,0.5)' }}>
          Paul Atreides se une a Chani y a los Fremen mientras busca venganza contra los conspiradores que destruyeron a su familia. Enfrentándose a una elección entre el amor de su vida y el destino del universo.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: '#f4e951', color: 'black', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 12px rgba(244,233,81,0.3)' }}>
            Reservar Ahora
          </button>
          <button style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '0.8rem 2.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            Ver Trailer
          </button>
        </div>
      </section>

      <MovieCatalog />

    </div>
  );
};