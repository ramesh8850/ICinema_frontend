import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  searchQuery: string = '';

  constructor(public authService: AuthService, private router: Router) { }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/home'], { queryParams: { search: this.searchQuery } });
    } else {
      // If empty, navigate to home (clears search)
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
