import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { BookingComponent } from './components/booking/booking.component';
import { PaymentComponent } from './components/payment/payment.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { ScreenMatrixComponent } from './components/screen-matrix/screen-matrix.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'movie/:id/shows', component: ScreenMatrixComponent }, // New Route for US-05
  { path: 'booking/:showId', component: BookingComponent },
  { path: 'payment', component: PaymentComponent }, // Expects data via state or service
  { path: 'ticket/:bookingId', component: TicketComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
