import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../services/movie.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  movies: any[] = [];
  loading: boolean = true;
  error: string = '';

  // Filter Data
  genres: { name: string, count: number }[] = [];
  languages: { name: string, count: number }[] = [];

  // Selected Filters
  filterGenre: string = '';
  filterLanguage: string = '';
  filterRating: number | null = null;

  // Keep a full copy for client-side filtering if needed, checking existing code logic
  allMovies: any[] = [];

  constructor(private movieService: MovieService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchMovies(params['search']);
      } else {
        this.loadMovies();
      }
    });
  }

  loadMovies() {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (response: any) => {
        // Handle unwrapped response or data property
        this.movies = response.data || response;
        this.allMovies = [...this.movies];
        this.calculateFilterCounts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching movies', err);
        this.error = 'Failed to load movies.';
        this.loading = false;
      }
    });
  }

  calculateFilterCounts() {
    const genreMap = new Map<string, number>();
    const langMap = new Map<string, number>();

    this.allMovies.forEach(movie => {
      if (movie.genre) genreMap.set(movie.genre, (genreMap.get(movie.genre) || 0) + 1);
      if (movie.language) langMap.set(movie.language, (langMap.get(movie.language) || 0) + 1);
    });

    this.genres = Array.from(genreMap, ([name, count]) => ({ name, count }));
    this.languages = Array.from(langMap, ([name, count]) => ({ name, count }));
  }

  searchMovies(query: string) {
    this.loading = true;
    this.movieService.searchMovies(query).subscribe({
      next: (response: any) => {
        this.movies = response.data || response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching movies', err);
        this.loading = false;
      }
    });
  }

  applyFilter() {
    this.loading = true;
    this.movieService.filterMovies(this.filterGenre, this.filterLanguage, this.filterRating || undefined).subscribe({
      next: (response: any) => {
        this.movies = response.data || response;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
