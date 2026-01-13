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
  // Multi-Select Filters
  selectedGenres: Set<string> = new Set();
  selectedLanguages: Set<string> = new Set();
  selectedCensorRatings: Set<string> = new Set();

  // Dropdown UI State
  genreDropdownOpen: boolean = false;
  langDropdownOpen: boolean = false;
  censorDropdownOpen: boolean = false;

  // Available Censor Ratings (could be fetched or static)
  censorRatings: string[] = ['U', 'UA', 'A', 'S'];

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
      if (movie.genre) {
        // Split by comma and trim to handle "Action, Comedy"
        const genres = movie.genre.split(',').map((g: string) => g.trim());
        genres.forEach((g: string) => {
          if (g) genreMap.set(g, (genreMap.get(g) || 0) + 1);
        });
      }
      if (movie.language) langMap.set(movie.language, (langMap.get(movie.language) || 0) + 1);
    });

    this.genres = Array.from(genreMap, ([name, count]) => ({ name, count }));
    this.languages = Array.from(langMap, ([name, count]) => ({ name, count }));

    console.log('DEBUG: Filter Data Calculation:');
    console.log('DEBUG: Total Movies:', this.allMovies.length);
    console.log('DEBUG: Genres Found:', this.genres);
    console.log('DEBUG: Languages Found:', this.languages);
  }

  getGenresArray(genreString: string): string[] {
    return genreString ? genreString.split(',').map(g => g.trim()) : [];
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

  toggleGenre(genre: string) {
    if (this.selectedGenres.has(genre)) {
      this.selectedGenres.delete(genre);
    } else {
      this.selectedGenres.add(genre);
    }
    this.applyFilter();
  }

  toggleLanguage(language: string) {
    if (this.selectedLanguages.has(language)) {
      this.selectedLanguages.delete(language);
    } else {
      this.selectedLanguages.add(language);
    }
    this.applyFilter();
  }

  toggleCensorRating(rating: string) {
    if (this.selectedCensorRatings.has(rating)) {
      this.selectedCensorRatings.delete(rating);
    } else {
      this.selectedCensorRatings.add(rating);
    }
    // We don't have backend support for Censor Filter yet, but let's implement the logic.
    // Wait, backend filterMovies does NOT take censor rating. 
    // I will filter Censor Rating CLIENT SIDE for now to avoid breaking backend contract repeatedly.
    // OR: I can pass it as part of a generic filter? No.
    // Let's implement Genre/Lang server-side, Censor client-side if needed?
    // User requested "multi select... ratings also". 
    // I will stick to server-side for Genre/Lang. Censor probably needs client side filtering 
    // unless I update Backend again.
    // Let's update applyFilter to send proper pipe strings.
    this.applyFilter();
  }

  // Dropdown UI Toggles
  toggleGenreDropdown() {
    this.genreDropdownOpen = !this.genreDropdownOpen;
    console.log('DEBUG: Genre Dropdown Toggled. New State:', this.genreDropdownOpen);
  }
  toggleLangDropdown() { this.langDropdownOpen = !this.langDropdownOpen; }
  toggleCensorDropdown() { this.censorDropdownOpen = !this.censorDropdownOpen; }

  // Helper to check if item is selected
  isGenreSelected(g: string): boolean { return this.selectedGenres.has(g); }
  isLanguageSelected(l: string): boolean { return this.selectedLanguages.has(l); }
  isCensorSelected(c: string): boolean { return this.selectedCensorRatings.has(c); }

  applyFilter() {
    this.loading = true;
    const genreParam = Array.from(this.selectedGenres).join('|');
    const langParam = Array.from(this.selectedLanguages).join('|');

    // Note: Censor Rating is not yet sent to backend. I will add client-side filtering 
    // after fetching results to handle mixed mode, OR ignores it for now.
    // Ideally backend should handle it. 
    // Let's rely on Genre/Lang for now as requested.

    this.movieService.filterMovies(genreParam, langParam, this.filterRating || undefined).subscribe({
      next: (response: any) => {
        let fetchedMovies = response.data || response;

        // Client-side filter for Censor Rating (since backend param is missing)
        if (this.selectedCensorRatings.size > 0) {
          fetchedMovies = fetchedMovies.filter((m: any) => this.selectedCensorRatings.has(m.censorRating));
        }

        this.movies = fetchedMovies;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
