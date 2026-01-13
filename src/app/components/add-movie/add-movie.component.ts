import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-movie',
    templateUrl: './add-movie.component.html',
    styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent implements OnInit {
    movieForm: FormGroup;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private movieService: MovieService,
        private router: Router
    ) {
        this.movieForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            genre: ['', Validators.required],
            language: ['', Validators.required],
            releaseDate: ['', Validators.required],
            durationMinutes: ['', [Validators.required, Validators.min(1)]],
            imageUrl: ['', Validators.required],
            censorRating: ['', Validators.required]
        });
    }

    ngOnInit(): void {
    }

    onSubmit(): void {
        if (this.movieForm.valid) {
            this.movieService.addMovie(this.movieForm.value).subscribe(
                (response) => {
                    this.successMessage = 'Movie added successfully!';
                    this.movieForm.reset();
                    setTimeout(() => this.router.navigate(['/home']), 2000);
                },
                (error) => {
                    this.errorMessage = 'Failed to add movie. Please try again.';
                    console.error('Error adding movie:', error);
                }
            );
        } else {
            this.errorMessage = 'Please fill all required fields correctly.';
        }
    }
}
