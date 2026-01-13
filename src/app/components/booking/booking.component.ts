import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShowService } from '../../services/show.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingComponent implements OnInit {
  showId: number = 0;
  showSeats: any[] = [];
  // Booking Stages: 'INPUT' (US-06) -> 'SELECTION' (Visual)
  bookingStage: 'INPUT' | 'SELECTION' = 'INPUT';
  seatQuantity: number = 1;
  availableCount: number = 0;
  seatPriceDisplay: number = 0; // To display "Price per seat"

  rows: any[] = [];
  selectedSeats: any[] = [];
  totalAmount: number = 0;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private showService: ShowService,
    private bookingService: BookingService,
    private authService: AuthService
  ) { }

  show: any | null = null;

  ngOnInit(): void {
    this.showId = Number(this.route.snapshot.paramMap.get('showId'));
    if (this.showId) {
      this.loadData();
    } else {
      this.error = 'Invalid Show ID';
      this.loading = false;
    }
  }

  loadData() {
    this.loading = true;

    // Load Show Details first (for Movie ID, Title, etc.)
    this.showService.getShowById(this.showId).subscribe({
      next: (res: any) => {
        this.show = res.data;
        this.loadSeats(); // Load seats after show info
      },
      error: (err) => {
        console.error('Error loading show details', err);
        this.error = 'Failed to load show details';
        this.loading = false;
      }
    });
  }

  // Tiers for display
  priceTiers: { type: string, price: number, count: number }[] = [];

  loadSeats() {
    this.loading = true;
    this.showService.getShowSeats(this.showId).subscribe({
      next: (res: any) => {
        this.showSeats = res.data;
        this.processSeats(res.data);

        // Calculate availability
        this.availableCount = this.showSeats.filter(s => s.status === 'AVAILABLE').length;

        // Calculate Price Tiers with Availability Counts
        const typeStats = new Map<string, { price: number, count: number }>();

        this.showSeats.forEach(s => {
          if (s.price > 0) {
            const key = s.seatType || 'Standard';
            if (!typeStats.has(key)) {
              typeStats.set(key, { price: s.price, count: 0 });
            }
            if (s.status === 'AVAILABLE') {
              typeStats.get(key)!.count++;
            }
          }
        });

        this.priceTiers = Array.from(typeStats.entries()).map(([type, stats]) => ({
          type,
          price: stats.price,
          count: stats.count
        }));

        // Sort by price
        this.priceTiers.sort((a, b) => a.price - b.price);

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load seats.';
        this.loading = false;
      }
    });
  }

  // Sections for Visual Grouping
  seatSections: { type: string, price: number, rows: { name: string, seats: any[] }[] }[] = [];

  processSeats(seats: any[]) {
    // 1. Group seats by Type (and Price)
    const typeMap = new Map<string, any[]>();

    seats.forEach(seat => {
      // Create a unique key for Type+Price (e.g. "Gold-300")
      // or just group by Seat Type if price is uniform per type
      const typeKey = seat.seatType || 'Standard';
      if (!typeMap.has(typeKey)) {
        typeMap.set(typeKey, []);
      }
      typeMap.get(typeKey)?.push(seat);
    });

    // 2. For each Type, group into Rows
    this.seatSections = [];

    // Sort types by Price descending (Platinum -> Gold -> Silver) implies higher to lower on screen usually?
    // Actually, usually Silver is front (low price), Platinum back (high price).
    // Let's sort by Price Ascending (Cheapest First) or Descending provided by map iteration order generally.
    // Let's trust usage - maybe sort by price.
    const sortedTypes = Array.from(typeMap.keys()).sort((a, b) => {
      const priceA = typeMap.get(a)?.[0].price || 0;
      const priceB = typeMap.get(b)?.[0].price || 0;
      return priceA - priceB; // Ascending price (Silver top, Gold bottom?) 
      // Standard logic: Screen is at top. Silver is close to screen. Gold behind. Platinum back.
      // So cheapest first makes sense.
    });

    sortedTypes.forEach(type => {
      const typeSeats = typeMap.get(type) || [];
      const price = typeSeats[0]?.price || 0;

      // Group these seats by Row Name
      const rowsMap = new Map<string, any[]>();
      typeSeats.forEach(seat => {
        const row = seat.rowName;
        if (!rowsMap.has(row)) { rowsMap.set(row, []); }
        rowsMap.get(row)?.push(seat);
      });

      // Convert to Rows Array
      const rows = Array.from(rowsMap.keys()).sort().map(key => ({
        name: key,
        seats: (rowsMap.get(key) || []).sort((a: any, b: any) => a.seatNumber - b.seatNumber)
      }));

      this.seatSections.push({
        type: type,
        price: price,
        rows: rows
      });
    });
  }

  // US-06 Strict Validation
  checkAvailability() {
    if (this.seatQuantity > this.availableCount) {
      // "Required number of seats are not available"
      this.error = 'Required number of seats are not available';
    } else {
      this.error = '';
      this.bookingStage = 'SELECTION';
      this.selectedSeats = []; // Reset selection
      // Pre-calculate estimated total for display
      this.calculateTotal();
    }
  }

  goBackToShows() {
    if (this.show && this.show.movieId) {
      this.router.navigate(['/movie', this.show.movieId, 'shows']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  toggleSeat(seat: any) {
    if (seat.status === 'BOOKED' || seat.status === 'BLOCKED') return;

    // Use seatId (Physical ID) for unique identification, as 'id' (ShowSeat ID) is null for available seats
    const index = this.selectedSeats.findIndex(s => s.seatId === seat.seatId);
    if (index === -1) {
      // Logic for adding seat: enforce limit from Stage 1
      if (this.selectedSeats.length < this.seatQuantity) {
        this.selectedSeats.push(seat);
      } else {
        alert(`You can only select ${this.seatQuantity} seats.`);
        return;
      }
    } else {
      this.selectedSeats.splice(index, 1);
    }
    // Update total based on actual selection (though typically it should match estimate)
    this.calculateTotal();
  }

  calculateTotal() {
    // If strict Stage 1 passed, we can just use the quantity * price as the source of truth,
    // OR sum the actual seats if they have differing prices.
    // Let's use actual selection for accuracy but initial estimate for Stage 1.
    if (this.bookingStage === 'INPUT') {
      this.totalAmount = this.seatQuantity * this.seatPriceDisplay;
    } else {
      this.totalAmount = this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    }
  }

  isSelected(seat: any): boolean {
    return this.selectedSeats.some(s => s.seatId === seat.seatId);
  }

  proceedToBook() {
    if (this.bookingStage === 'SELECTION') {
      if (this.selectedSeats.length !== this.seatQuantity) {
        alert(`Please select exactly ${this.seatQuantity} seats.`);
        return;
      }
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const user = this.authService.getUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Robust ID extraction: Handle direct id or nested user.id (stale data case)
    let userId = user.id;
    if (!userId && user.user && user.user.id) {
      userId = user.user.id;
    }

    if (!userId) {
      alert('Authentication error: User ID missing. Please Logout and Login again.');
      return;
    }

    const bookingPayload = {
      userId: userId,
      showId: this.showId,
      showSeatIds: this.selectedSeats.map(s => s.seatId)
    };

    this.bookingService.createBooking(bookingPayload).subscribe({
      next: (res: any) => {
        const booking = res.data;
        // Pass booking details to payment page
        this.router.navigate(['/payment'], {
          state: {
            booking: res.data
          }
        });
      },
      error: (err) => {
        console.error('Booking failed', err);
        alert('Booking failed. Please try again.');
      }
    });
  }
}
