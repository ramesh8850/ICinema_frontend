import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ScreenDTO {
    id?: number;
    screenName: string;
    totalSeats: number;
    theatreId: number;
}

@Injectable({
    providedIn: 'root'
})
export class ScreenService {
    private apiUrl = `${environment.apiUrl}/screens`;

    constructor(private http: HttpClient) { }

    addScreen(screen: ScreenDTO): Observable<any> {
        return this.http.post(this.apiUrl, screen);
    }
}
