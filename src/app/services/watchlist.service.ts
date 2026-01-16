import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    private apiUrl = `${environment.apiUrl}/watchlist`;

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
    }

    toggleWatchlist(movieId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/toggle/${movieId}`, {}, { headers: this.getHeaders() });
    }

    getMyWatchlist(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
    }

    checkStatus(movieId: number): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/check/${movieId}`, { headers: this.getHeaders() });
    }
}
