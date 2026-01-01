import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ShowService {
    private apiUrl = `${environment.apiUrl}/shows`;

    constructor(private http: HttpClient) { }

    getShowsByMovieId(movieId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${movieId}`);
    }

    getShowSeats(showId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${showId}/seats`);
    }

    getShowById(showId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/id/${showId}`);
    }
}
