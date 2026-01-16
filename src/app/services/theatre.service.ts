import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Screen {
    id: number;
    screenName: string; // Matched with Backend DTO
    totalSeats: number;
}

export interface Theatre {
    id: number;
    name: string;
    city: string;
    address: string;
    screens?: Screen[];
}

@Injectable({
    providedIn: 'root'
})
export class TheatreService {
    private apiUrl = `${environment.apiUrl}/theatres`; // Check backend controller path

    constructor(private http: HttpClient) { }

    getAllTheatres(): Observable<Theatre[]> {
        return this.http.get<Theatre[]>(this.apiUrl);
    }

    getScreensByTheatre(theatreId: number): Observable<Screen[]> {
        return this.http.get<Screen[]>(`${environment.apiUrl}/screens/theatre/${theatreId}`);
    }

    addTheatre(theatre: Theatre): Observable<any> {
        return this.http.post(this.apiUrl, theatre);
    }
}
