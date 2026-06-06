from django.contrib import admin
from .models import Genre, Movie, Room, Screening

admin.site.register(Genre)
admin.site.register(Movie)
admin.site.register(Room)
admin.site.register(Screening)