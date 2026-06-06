from django.db import models
import uuid

class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nombre")

    class Meta:
        db_table = 'catalog_genres' # Especificamos el esquema lógico
        verbose_name = "Género"
        verbose_name_plural = "Géneros"

    def __str__(self):
        return self.name

class Movie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Título")
    synopsis = models.TextField(verbose_name="Sinopsis")
    director = models.CharField(max_length=150, verbose_name="Director")
    duration_min = models.IntegerField(verbose_name="Duración (min)")
    rating_classification = models.CharField(max_length=10, choices=[
        ('ATP', 'Apta para Todo Público'),
        ('+13', 'Mayores de 13'),
        ('+16', 'Mayores de 16'),
        ('+18', 'Mayores de 18')
    ], verbose_name="Clasificación")
    release_date = models.DateField(verbose_name="Fecha de Estreno")
    poster_url = models.URLField(max_length=500, blank=True, verbose_name="URL del Póster")
    trailer_url = models.URLField(max_length=500, blank=True, verbose_name="URL del Tráiler")
    is_active = models.BooleanField(default=True, verbose_name="Activa en Cartelera")
    
    # Relación M2M con Géneros
    genres = models.ManyToManyField(Genre, db_table='catalog_movie_genres', verbose_name="Géneros")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'catalog_movies'
        verbose_name = "Película"
        verbose_name_plural = "Películas"

    def __str__(self):
        return self.title

class Room(models.Model):
    name = models.CharField(max_length=50, verbose_name="Nombre de la Sala")
    capacity = models.IntegerField(verbose_name="Capacidad")
    layout_json = models.JSONField(verbose_name="Distribución de Butacas (JSON)")

    class Meta:
        db_table = 'catalog_rooms'
        verbose_name = "Sala"
        verbose_name_plural = "Salas"

    def __str__(self):
        return self.name

class Screening(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='screenings', verbose_name="Película")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='screenings', verbose_name="Sala")
    start_time = models.DateTimeField(verbose_name="Horario de Inicio")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    is_active = models.BooleanField(default=True, verbose_name="Función Activa")

    class Meta:
        db_table = 'catalog_screenings'
        verbose_name = "Función"
        verbose_name_plural = "Funciones"

    def __str__(self):
        return f"{self.movie.title} - {self.room.name} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"