import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { BookingComponent } from './components/booking/booking.component';
import { PaymentComponent } from './components/payment/payment.component';
import { TicketComponent } from './components/ticket/ticket.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ScreenMatrixComponent } from './components/screen-matrix/screen-matrix.component';
import { BottomNavComponent } from './components/bottom-nav/bottom-nav.component';
import { AddMovieComponent } from './components/add-movie/add-movie.component';
import { ManageShowsComponent } from './components/manage-shows/manage-shows.component';
import { ManageScreensComponent } from './components/manage-screens/manage-screens.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    MovieDetailsComponent,
    BookingComponent,
    PaymentComponent,
    TicketComponent,
    LoginComponent,
    RegisterComponent,
    ScreenMatrixComponent,
    BottomNavComponent,
    AddMovieComponent,
    AddMovieComponent,
    ManageShowsComponent,
    ManageScreensComponent,
    AdminDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
