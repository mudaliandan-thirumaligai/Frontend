import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import { EmailValidator } from '@angular/forms';

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // TODO: Replace this with actual JWT from login in future
  private token = 'MY-TOKEN';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      })
    };
  }

  /**
   * Change user password
   * @param payload oldPassword & newPassword along with username
   */
  changePassword(payload: ChangePasswordPayload): Observable<any> {
    const url = `${environment.apiUrl}/auth/change-password`;
    return this.http.put(url, payload, this.getHttpOptions()).pipe(
      catchError(err => throwError(() => err))
    );
  }

  /**
   * Register a new user
   * @param payload username & password
   */
  register(payload: RegisterPayload): Observable<any> {
    const url = `${environment.apiUrl}/auth/register`;
    return this.http.post(url, payload, this.getHttpOptions()).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
