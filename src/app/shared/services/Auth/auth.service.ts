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

  // FIX 1: Make sure initial values always come from sessionStorage
  private loggedInSubject = new BehaviorSubject<boolean>(!!sessionStorage.getItem('token'));
  loggedIn$ = this.loggedInSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(sessionStorage.getItem('role'));
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap(res => console.log('Registration successful')),
      catchError(err => throwError(() => err))
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signin`, { username, password }).pipe(
      tap((res: any) => {

        // FIX 2: store values in sessionStorage
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('username', res.username);
        sessionStorage.setItem('role', res.role);

        // FIX 3: broadcast login + role
        this.loggedInSubject.next(true);
        this.roleSubject.next(res.role);

        this.router.navigate(['/admin/calendar']);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout(): void {
    // FIX 4: fully reset UI state
    sessionStorage.clear();
    this.loggedInSubject.next(false);
    this.roleSubject.next(null);
    this.router.navigate(['']);
  }

  forgotPassword(username: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { username });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  changePassword(payload: { oldPassword: string; newPassword: string }) {
    const token = sessionStorage.getItem('token');
    return this.http.put(
      `${environment.apiUrl}/auth/change-password`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
