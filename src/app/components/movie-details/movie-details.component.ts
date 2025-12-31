import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { ShowService } from '../../services/show.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
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
  reviewForm: FormGroup;
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private showService: ShowService,
    private reviewService: ReviewService,
    public authService: AuthService,
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
          error: (err) => {
            console.error('Error loading reviews', err);
            // Reviews are optional
            this.loading = false;
          }
        });
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

    const reviewData = {
      movieId: this.movie.id,
      userId: this.authService.getUser().id,
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment
    };

    this.reviewService.addReview(reviewData).subscribe({
      next: (res: any) => {
        // Reload reviews
        this.loadData(this.movie.id);
        this.reviewForm.reset({ rating: 5 });
      },
      error: (err) => {
        console.error('Error submitting review', err);
        alert('Failed to submit review.');
      }
    });
  }
}
