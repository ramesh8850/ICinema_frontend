import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService } from '../../services/movie.service';
import { TheatreService, Theatre, Screen } from '../../services/theatre.service';
import { ShowService } from '../../services/show.service';

@Component({
    selector: 'app-manage-shows',
    templateUrl: './manage-shows.component.html',
    styleUrls: ['./manage-shows.component.css']
})
export class ManageShowsComponent implements OnInit {
    showForm: FormGroup;
    movies: any[] = [];
    theatres: Theatre[] = [];
    screens: Screen[] = [];
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private fb: FormBuilder,
        private movieService: MovieService,
        private theatreService: TheatreService,
        private showService: ShowService
    ) {
        this.showForm = this.fb.group({
            movieId: ['', Validators.required],
            theatreId: ['', Validators.required],
            screenId: [{ value: '', disabled: true }, Validators.required], // Initialize disabled
            showDate: ['', Validators.required],
            endDate: [''], // Optional end date for range
            showTime: ['', Validators.required],
            priceGold: [200, [Validators.required, Validators.min(0)]],
            priceSilver: [150, [Validators.required, Validators.min(0)]],
            pricePlatinum: [250, [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadMovies();
        this.loadTheatres();

        // Listen to theatre changes to load screens
        this.showForm.get('theatreId')?.valueChanges.subscribe(theatreId => {
            if (theatreId) {
                this.loadScreens(theatreId);
                this.showForm.get('screenId')?.enable();
            } else {
                this.screens = [];
                this.showForm.get('screenId')?.disable();
                this.showForm.get('screenId')?.setValue('');
            }
        });
    }

    loadMovies() {
        this.movieService.getAllMovies().subscribe({
            next: (wrapper: any) => this.movies = wrapper.data, // Extract data
            error: (err) => console.error('Error loading movies', err)
        });
    }

    loadTheatres() {
        this.theatreService.getAllTheatres().subscribe({
            next: (wrapper: any) => this.theatres = wrapper.data, // Extract data
            error: (err) => console.error('Error loading theatres', err)
        });
    }

    loadScreens(theatreId: number) {
        this.theatreService.getScreensByTheatre(theatreId).subscribe({
            next: (wrapper: any) => this.screens = wrapper.data, // Extract data
            error: (err) => console.error('Error loading screens', err)
        });
    }

    onSubmit() {
        if (this.showForm.invalid) {
            return;
        }

        const formValue = this.showForm.value;
        const startDate = new Date(formValue.showDate);
        const endDate = formValue.endDate ? new Date(formValue.endDate) : startDate;

        // Validation: End Date must be after Start Date
        if (endDate < startDate) {
            this.errorMessage = 'End Date cannot be before Start Date';
            return;
        }

        const dates: Date[] = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        this.successMessage = `Creating shows for ${dates.length} days...`;

        let completed = 0;
        let errors = 0;

        dates.forEach(date => {
            const dateString = date.toISOString().split('T')[0];
            const showDTO = {
                movieId: formValue.movieId,
                screenId: formValue.screenId,
                showDate: dateString,
                showTime: formValue.showTime + ':00',
                seatPrices: {
                    'GOLD': formValue.priceGold,
                    'SILVER': formValue.priceSilver,
                    'PLATINUM': formValue.pricePlatinum
                }
            };

            this.showService.addShow(showDTO).subscribe({
                next: () => {
                    completed++;
                    this.checkCompletion(dates.length, completed, errors);
                },
                error: (err) => {
                    console.error('Failed for date ' + dateString, err);
                    errors++;
                    this.checkCompletion(dates.length, completed, errors);
                }
            });
        });
    }

    checkCompletion(total: number, completed: number, errors: number) {
        if (completed + errors === total) {
            if (errors === 0) {
                this.successMessage = `Successfully created ${completed} shows!`;
                this.showForm.reset();
                this.showForm.patchValue({
                    priceGold: 200, priceSilver: 150, pricePlatinum: 250
                });
            } else {
                this.errorMessage = `Created ${completed} shows, but failed ${errors}. Check console details.`;
                this.successMessage = '';
            }
        }
    }
}
