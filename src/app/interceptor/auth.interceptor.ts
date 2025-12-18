import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../shared/services/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // 🔐 Get token (later from login API)
    const token = localStorage.getItem('token');

    // 🔁 Clone request only if token exists
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          this.toast.showError('Unauthorized. Please login again.');
        } else if (error.status === 403) {
          this.toast.showError('Access denied.');
        }

        return throwError(() => error);
      })
    );
  }
}
