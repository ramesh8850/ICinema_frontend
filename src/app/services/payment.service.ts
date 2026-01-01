import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    makePayment(paymentData: any): Observable<any> {
        return this.http.post(this.apiUrl, paymentData);
    }

    cancelBooking(bookingId: number): Observable<any> {
        return this.http.put(`${environment.apiUrl}/bookings/${bookingId}/cancel`, {});
    }
}
