import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    let params = '';
    if (genre) params += `genre=${genre}&`;
    if (language) params += `language=${language}&`;
    if (rating) params += `rating=${rating}`;
    return this.http.get(`${this.apiUrl}/filter?${params}`);
  }
}
