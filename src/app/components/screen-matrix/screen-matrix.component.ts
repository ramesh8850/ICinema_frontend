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
  }
}
