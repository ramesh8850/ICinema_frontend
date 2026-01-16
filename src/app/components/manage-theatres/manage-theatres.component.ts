import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Theatre, TheatreService } from '../../services/theatre.service';

@Component({
    selector: 'app-manage-theatres',
    templateUrl: './manage-theatres.component.html',
    styleUrls: ['./manage-theatres.component.css']
})
export class ManageTheatresComponent implements OnInit {
    theatres: Theatre[] = [];
    theatreForm: FormGroup;
    showForm: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(private theatreService: TheatreService, private fb: FormBuilder) {
        this.theatreForm = this.fb.group({
            name: ['', Validators.required],
            city: ['', Validators.required],
            address: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.loadTheatres();
    }

    loadTheatres() {
        this.theatreService.getAllTheatres().subscribe({
            next: (data) => {
                // Handle wrapped response if necessary, similar to other services
                this.theatres = (data as any).data ? (data as any).data : data;
            },
            error: (err) => console.error('Failed to load theatres', err)
        });
    }

    onSubmit() {
        if (this.theatreForm.valid) {
            this.theatreService.addTheatre(this.theatreForm.value).subscribe({
                next: (res) => {
                    this.successMessage = 'Theatre added successfully!';
                    this.errorMessage = '';
                    this.showForm = false;
                    this.theatreForm.reset();
                    this.loadTheatres();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (err) => {
                    this.errorMessage = 'Failed to add theatre.';
                    this.successMessage = '';
                    console.error(err);
                }
            });
        }
    }

    toggleForm() {
        this.showForm = !this.showForm;
        this.successMessage = '';
        this.errorMessage = '';
    }
}
