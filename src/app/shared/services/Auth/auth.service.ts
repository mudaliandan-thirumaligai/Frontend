import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, tap, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environment/environment';


export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
}
export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(localStorage.getItem('role'));
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}


  register(payload: RegisterPayload): Observable<any> {
    console.log('AuthService: Registering user', payload);

    return this.http.post(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res: any) => {
        console.log('AuthService: Registration successful', res);
      }),
      catchError(err => {
        console.error('AuthService: Registration failed', err);
        return throwError(() => err);
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    console.log('AuthService: Initiating login for', username, password);
    return this.http.post(`${environment.apiUrl}/auth/signin`, { username, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('role', res.role);
        console.log('AuthService: Stored token in localStorage');

        // Broadcast changes
        this.loggedInSubject.next(true);
        this.roleSubject.next(res.role);

        
      console.log('AuthService: Navigating to /admin/events');
        this.router.navigate(['/admin/calendar']);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    localStorage.clear();
    this.loggedInSubject.next(false);
    this.roleSubject.next(null);
    this.router.navigate(['']);       //navigate to home page after logout
  }

  
  forgotPassword(username: string): Observable<any> {
    const url = `${environment.apiUrl}/auth/forgot-password`;
    return this.http.post(url, { username });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${environment.apiUrl}/auth/reset-password`;
    return this.http.post(url, { token, newPassword });
  }

  changePassword(payload: { oldPassword: string; newPassword: string }) {
    const token = localStorage.getItem('token');

    return this.http.put<any>(
      `${environment.apiUrl}/auth/change-password`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }




}
