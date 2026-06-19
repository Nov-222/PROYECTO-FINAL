import { apiClient } from '../../shared/api/apiClient';

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  director: string;
  duration_minutes: number;
  rating_classification: string;
  release_date: string;
  poster_url: string;
  trailer_url: string;
}

export interface CatalogResponse {
  items: Movie[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const fetchMovies = async (page: number = 1, size: number = 12): Promise<CatalogResponse> => {
  const response = await apiClient.get<CatalogResponse>('/api/v1/catalog/movies', {
    params: { page, size }
  });
  return response.data;
};