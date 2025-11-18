import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // TODO: Replace this with actual JWT from login in future
  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTBmNjA2NjE1MjVmMDUxN2M2ZWJiMjYiLCJ1c2VybmFtZSI6InVzZXI3Iiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzYzNDQzMzE1LCJleHAiOjE3NjM0NDY5MTV9.-HO3qFVgtsYIDLzkPI9SoMPCrFdrmWg6pzNKMERYpp0';

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
