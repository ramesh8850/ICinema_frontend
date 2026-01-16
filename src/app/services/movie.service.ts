import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) { }

  getAllMovies(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getMovieById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search?query=${query}`);
  }

  filterMovies(genre?: string, language?: string, rating?: number): Observable<any> {
    let params = new HttpParams();
    if (genre) params = params.set('genre', genre);
    if (language) params = params.set('language', language);
    if (rating) params = params.set('rating', rating);

    return this.http.get(`${this.apiUrl}/filter`, { params });
  }

  addMovie(movie: any): Observable<any> {
    return this.http.post(this.apiUrl, movie);
  }

  updateMovie(id: number, movie: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, movie);
  }

  deleteMovie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
