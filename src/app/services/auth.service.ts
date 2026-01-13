import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!sessionStorage.getItem('user');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        console.log('DEBUG: Full Login Response:', response); // Inspect this!
        if (response.data && response.data.token) {
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
          this.loggedInSubject.next(true);
        }
      })
    );
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.loggedInSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getUser();
    console.log('DEBUG: Checking Admin. User Object:', user);

    // Handle nested 'user' object if it exists (Defensive fix for inconsistent backend response)
    const actualUser = user && user.user ? user.user : user;
    const roles = actualUser ? actualUser.roles : [];

    console.log('DEBUG: Actual User Roles:', roles);

    const hasRole = roles && (roles.includes('ROLE_ADMIN') || roles.some((r: any) => r.name === 'ROLE_ADMIN' || r === 'ROLE_ADMIN'));

    console.log('DEBUG: isAdmin Result:', hasRole);
    return hasRole;
  }

  getUser(): any {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    this.loggedInSubject.next(false);
  }
}
