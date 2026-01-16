import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { WatchlistService } from '../../services/watchlist.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
    activeTab: 'bookings' | 'watchlist' | 'settings' = 'bookings';
    bookings: any[] = [];
    watchlist: any[] = [];
    user: any = null;
    loading: boolean = false;

    constructor(
        private bookingService: BookingService,
        private watchlistService: WatchlistService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.user = this.authService.getUser();
        this.loadBookings();
        this.loadWatchlist();
    }

    loadBookings() {
        const user = this.user;
        const actualUser = (user && user.user) ? user.user : user;

        if (!actualUser || !actualUser.id) return;

        this.loading = true;
        this.bookingService.getBookingByUser(actualUser.id).subscribe({
            next: (response: any) => {
                const bookings = response.data || []; // Extract data from wrapper
                this.bookings = bookings.sort((a: any, b: any) =>
                    new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
                ); // Newest first
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load bookings', err);
                this.loading = false;
            }
        });
    }

    loadWatchlist() {
        this.watchlistService.getMyWatchlist().subscribe({
            next: (data) => this.watchlist = data,
            error: (err) => console.error('Failed to load watchlist', err)
        });
    }

    removeFromWatchlist(movieId: number) {
        this.watchlistService.toggleWatchlist(movieId).subscribe(() => {
            this.loadWatchlist(); // Reload list
        });
    }

    logout() {
        this.authService.logout();
    }
}
