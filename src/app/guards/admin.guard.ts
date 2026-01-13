import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): boolean | UrlTree {
        const isLoggedIn = this.authService.isLoggedIn();
        const isAdmin = this.authService.isAdmin();
        console.log(`DEBUG: AdminGuard Check - LoggedIn: ${isLoggedIn}, IsAdmin: ${isAdmin}`);

        if (isLoggedIn && isAdmin) {
            return true;
        }

        console.warn('DEBUG: AdminGuard Blocked Access! Redirecting to Home.');
        // Redirect non-admins to home (or login if not logged in)
        return this.router.createUrlTree(['/home']);
    }
}
