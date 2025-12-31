import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  bookingId: number = 0;
  totalAmount: number = 0;
  cardNumber: string = '';
  expiry: string = '';
  cvv: string = '';
  paymentMode: string = 'CREDIT_CARD'; // Default
  loading: boolean = false;
  // Error Handling
  pageError: string = ''; // Fatal (hides form)
  formError: string = ''; // Validation (shows inline)
  bookingData: any = null;

  // Payment Logic
  originalAmount: number = 0;
  discountAmount: number = 0;
  finalAmount: number = 0;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private location: Location
  ) {
    const state = this.location.getState() as any;
    if (state && state.booking) {
      this.bookingId = state.booking.id;
      this.originalAmount = state.booking.totalAmount;
      this.bookingData = state.booking; // store full data
      this.calculateDiscount(); // Initial calc
    } else {
      // Fallback or user navigated directly
      this.pageError = 'No booking details found. Please select seats again.';
    }
  }

  ngOnInit(): void {
  }

  // US-09: Discount Logic
  calculateDiscount() {
    if (this.paymentMode === 'CREDIT_CARD') {
      this.discountAmount = this.originalAmount * 0.10; // 10%
    } else if (this.paymentMode === 'DEBIT_CARD') {
      this.discountAmount = this.originalAmount * 0.05; // 5%
    } else {
      this.discountAmount = 0;
    }
    this.totalAmount = this.originalAmount - this.discountAmount;
  }

  // Regex Validators
  isValidCard(): boolean {
    return /^\d{16}$/.test(this.cardNumber.replace(/\s/g, ''));
  }

  isValidExpiry(): boolean {
    // Simple MM/YY check. ideally check if future date.
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.expiry)) return false;

    const [month, yearStr] = this.expiry.split('/');
    const year = 2000 + parseInt(yearStr);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && parseInt(month) < currentMonth) return false;

    return true;
  }

  isValidCVV(): boolean {
    return /^\d{3}$/.test(this.cvv);
  }

  processPayment() {
    this.formError = ''; // Reset form error

    if (!this.isValidCard() || !this.isValidExpiry() || !this.isValidCVV()) {
      this.formError = 'Invalid Payment Details. Please check Card Number (16 digits), Expiry (Future MM/YY), and CVV (3 digits).';
      return;
    }

    this.loading = true;
    const paymentPayload = {
      bookingId: this.bookingId,
      amountPaid: this.totalAmount, // Send discounted amount
      paymentMode: this.paymentMode,
      // card details not sent to backend in this mock
    };

    this.paymentService.makePayment(paymentPayload).subscribe({
      next: (res) => {
        // Success
        this.router.navigate(['/ticket', this.bookingId]);
      },
      error: (err) => {
        console.error('Payment failed', err);
        // Do not hide form on API failure, show inline error
        this.formError = 'Payment failed. Please try again or check your connection.';
        this.loading = false;
      }
    });
  }

  // Navigation Logic
  // Navigation Logic
  goBackToSeats() {
    // Release the blocked seats before navigating back
    if (this.bookingId) {
      this.paymentService.cancelBooking(this.bookingId).subscribe({
        next: () => {
          console.log('Booking cancelled successfully');
          this.navigateBack();
        },
        error: (err) => {
          console.error('Failed to cancel booking', err);
          // Navigate anyway so user isn't stuck
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  navigateBack() {
    if (this.bookingData && this.bookingData.showId) {
      // Go back to Booking Page (Seat Selection)
      this.router.navigate(['/booking', this.bookingData.showId]);
    } else {
      // Fallback
      this.router.navigate(['/home']);
    }
  }
}
