import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css']
})
export class BottomNavComponent implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  showSearch: boolean = false;
  searchQuery: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.isAdmin = this.authService.isAdmin(); // Update Admin status on login change
    });
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin(); // Initial check
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.searchQuery = '';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/home'], { queryParams: { search: this.searchQuery } });
      this.toggleSearch();
    }
  }
}
