import type { Movie } from '../catalogApi';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard = ({ movie }: MovieCardProps) => {
  const hours = Math.floor(movie.duration_minutes / 60);
  const minutes = movie.duration_minutes % 60;
  const durationText = `${hours}h ${minutes}m`;

  return (
    <div className="movie-card">
      <div className="movie-card__image-wrapper">
        <img 
          src={movie.poster_url} 
          alt={`Afiche de ${movie.title}`} 
          className="movie-card__image"
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x450/2a2c36/FFFFFF?text=Sin+Afiche' }}
        />
        <div className="movie-card__overlay">
          <button className="movie-card__btn-trailer">Ver Trailer</button>
        </div>
      </div>
      
      <div className="movie-card__info">
        <h3 className="movie-card__title" title={movie.title}>{movie.title}</h3>
        <p className="movie-card__meta">
          {movie.genres.slice(0, 2).join(' / ')} 
        </p>
        <p className="movie-card__details">
          {durationText} • {movie.rating_classification}
        </p>
        <button className="movie-card__btn-book">Reservar Ticket</button>
      </div>
    </div>
  );
};