import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) { }

  createBooking(bookingData: any): Observable<any> {
    return this.http.post(this.apiUrl, bookingData);
  }

  getBookingByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getTicketDetails(bookingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${bookingId}/ticket`);
  }
}
