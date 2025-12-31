import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ShowService {
    private apiUrl = 'http://localhost:8080/api/shows';

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
