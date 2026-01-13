import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TheatreService, Theatre } from '../../services/theatre.service';
import { ScreenService, ScreenDTO } from '../../services/screen.service';

@Component({
    selector: 'app-manage-screens',
    templateUrl: './manage-screens.component.html',
    styleUrls: ['./manage-screens.component.css']
})
export class ManageScreensComponent implements OnInit {
    screenForm: FormGroup;
    theatres: Theatre[] = [];
    loading = false;
    successMessage = '';
    errorMessage = '';

    constructor(
        private fb: FormBuilder,
        private theatreService: TheatreService,
        private screenService: ScreenService
    ) {
        this.screenForm = this.fb.group({
            theatreId: ['', Validators.required],
            screenName: ['', [Validators.required, Validators.minLength(3)]],
            totalSeats: ['', [Validators.required, Validators.min(10), Validators.max(500)]]
        });
    }

    ngOnInit(): void {
        this.loadTheatres();
    }

    loadTheatres() {
        this.theatreService.getAllTheatres().subscribe({
            next: (wrapper: any) => this.theatres = wrapper.data,
            error: (err) => this.errorMessage = 'Failed to load theatres.'
        });
    }

    onSubmit() {
        if (this.screenForm.invalid) return;

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        const payload: ScreenDTO = {
            theatreId: Number(this.screenForm.value.theatreId),
            screenName: this.screenForm.value.screenName,
            totalSeats: this.screenForm.value.totalSeats
        };

        this.screenService.addScreen(payload).subscribe({
            next: (res) => {
                this.successMessage = `Screen "${res.data.screenName}" added successfully! Seats generated automatically.`;
                this.loading = false;
                this.screenForm.reset();
            },
            error: (err) => {
                console.error(err);
                this.errorMessage = 'Failed to add screen. Please try again.';
                this.loading = false;
            }
        });
    }
}
