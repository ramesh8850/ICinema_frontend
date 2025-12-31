import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = 'http://localhost:8080/api/reviews';

    constructor(private http: HttpClient) { }

    addReview(review: any): Observable<any> {
        return this.http.post(this.apiUrl, review);
    }

    getReviewsByMovie(movieId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/movie/${movieId}`);
    }
}
