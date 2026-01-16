import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '../../services/movie.service';
import { ShowService } from '../../services/show.service';

@Component({
  selector: 'app-screen-matrix',
  templateUrl: './screen-matrix.component.html',
  styleUrls: ['./screen-matrix.component.css']
})
export class ScreenMatrixComponent implements OnInit {
  movie: any | null = null;
  shows: any[] = [];
  groupedShows: { [key: string]: any[] } = {};
  filteredGroupedShows: { [key: string]: any[] } = {}; // Holds filtered results
  filteredRowCount: number = 0;
  searchTerm: string = '';
  loading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private showService: ShowService,
    private router: Router
  ) { }

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

    // Load Movie Details
    this.movieService.getMovieById(movieId).subscribe({
      next: (res: any) => this.movie = res.data,
      error: (err) => {
        console.error('Error loading movie', err);
        this.error = 'Failed to load movie details.';
      }
    });

    // Load Shows
    this.showService.getShowsByMovieId(movieId).subscribe({
      next: (res: any) => {
        this.shows = res.data;
        this.groupShowsByTheatre();
        this.applyFilter(); // Initial filter needed
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading shows', err);
        this.error = 'Failed to load shows.';
        this.loading = false;
      }
    });
  }

  groupShowsByTheatre() {
    this.groupedShows = this.shows.reduce((acc, show) => {
      // Group by Theatre Name (Preferred) or Screen Name (Fallback)
      const key = show.theatreName || show.screenName || 'Unknown Theatre';

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(show);
      return acc;
    }, {});

    // Initialize filtered list with everything
    this.filteredGroupedShows = { ...this.groupedShows };
  }

  // New Search Filter Method
  applyFilter() {
    if (!this.searchTerm.trim()) {
      this.filteredGroupedShows = { ...this.groupedShows };
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const result: { [key: string]: any[] } = {};

    for (const theatreName in this.groupedShows) {
      const shows = this.groupedShows[theatreName];

      // Check Theatre Name matches
      const theatreMatches = theatreName.toLowerCase().includes(term);

      // Check if any Show/Screen/Time matches
      const matchingShows = shows.filter(show =>
        show.screenName?.toLowerCase().includes(term) ||
        show.showTime?.toLowerCase().includes(term)
      );

      // Include if header matches OR any children match
      if (theatreMatches) {
        // If theatre matches, show all shows (or you could strictly filter shows too)
        result[theatreName] = shows;
      } else if (matchingShows.length > 0) {
        // If theatre doesn't match, but filtering down to specific screens/times
        result[theatreName] = matchingShows;
      }
    }

    this.filteredGroupedShows = result;
    this.filteredRowCount = Object.keys(result).length;
  }
}
