import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { ShowService } from '../../services/show.service';

import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { WatchlistService } from '../../services/watchlist.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  movie: any | null = null;
  shows: any[] = [];
  reviews: any[] = [];
  inWatchlist: boolean = false;
  reviewForm: FormGroup;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private showService: ShowService,
    private reviewService: ReviewService,
    public authService: AuthService,
    private watchlistService: WatchlistService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const movieId = Number(this.route.snapshot.paramMap.get('id'));
    if (movieId) {
      this.loadData(movieId);
    } else {
      this.error = 'Invalid Movie ID';
      this.loading = false;
    }
  }

  loadData(movieId: number) {
    this.loading = true;

    // Load Movie
    this.movieService.getMovieById(movieId).subscribe({
      next: (movieRes: any) => {
        this.movie = movieRes.data;

        // Load Shows
        this.showService.getShowsByMovieId(movieId).subscribe({
          next: (showRes: any) => {
            this.shows = showRes.data;
          },
          error: (err) => console.error(err)
        });

        // Load Reviews
        this.reviewService.getReviewsByMovie(movieId).subscribe({
          next: (reviewRes: any) => {
            this.reviews = reviewRes.data || reviewRes; // Handle unwrapped list
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error loading reviews', err);
            // Reviews are optional
            this.loading = false;
          }
        });
        // Check Watchlist Status (if logged in)
        if (this.authService.isLoggedIn()) {
          this.watchlistService.checkStatus(movieId).subscribe({
            next: (status) => this.inWatchlist = status,
            error: (err) => console.error('Error checking watchlist', err)
          });
        }
      },
      error: (err) => {
        console.error('Error loading movie', err);
        this.error = 'Failed to load movie details.';
        this.loading = false;
      }
    });
  }

  submitReview() {
    if (this.reviewForm.invalid || !this.movie) return;

    const user = this.authService.getUser();

    // Defensive check for nested user object (in case stored incorrectly)
    const actualUser = (user && user.user) ? user.user : user;

    if (!actualUser || !actualUser.id) {
      console.error('DEBUG: User ID is missing!', user);
      alert('User identification failed. Please logout and login again.');
      return;
    }

    const reviewData = {
      movieId: this.movie.id,
      userId: actualUser.id,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };


    this.reviewService.addReview(reviewData).subscribe({
      next: (res: any) => {
        // Reload reviews
        this.loadData(this.movie.id);
        this.reviewForm.reset({ rating: 5 });
      },
      error: (err: any) => {
        console.error('Error submitting review', err);
        const errorMessage = err.error ? (err.error.message || err.error) : 'Failed to submit review.';
        alert(errorMessage);
      }
    });
  }


  toggleWatchlist() {
    if (!this.authService.isLoggedIn()) {
      alert('Please login to add to watchlist');
      return;
    }
    if (!this.movie) return;

    this.watchlistService.toggleWatchlist(this.movie.id).subscribe({
      next: (res) => {
        this.inWatchlist = !this.inWatchlist; // Optimistic update
      },
      error: (err) => {
        console.error('Error toggling watchlist', err);
        alert('Failed to update watchlist');
      }
    });
  }
}
