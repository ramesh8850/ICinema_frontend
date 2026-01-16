import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {
  bookingId: number = 0;
  ticket: any | null = null;
  qrPayload: string = ''; // Backend secure payload for QR
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.bookingId = Number(this.route.snapshot.paramMap.get('bookingId'));
    if (this.bookingId) {
      this.loadTicket();
    } else {
      this.error = 'Invalid Booking ID';
      this.loading = false;
    }
  }

  loadTicket() {
    this.loading = true;
    this.bookingService.getTicketDetails(this.bookingId).subscribe({
      next: (res: any) => {
        this.ticket = res.data;
        this.qrPayload = res.data.qrPayload; // Get secure payload
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load ticket details.';
        this.loading = false;
      }
    });
  }

  printTicket() {
    window.print();
  }
}
