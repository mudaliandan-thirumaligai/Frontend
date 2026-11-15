import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { ToastService } from '../shared/services/toast.service';

@Injectable()
export class RequestLogger implements HttpInterceptor {
  constructor(private toast: ToastService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Interceptor hit:', req.method, req.url);
    return next.handle(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            // Only show success toast for POST/PUT/DELETE requests (optional)
            if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
              this.toast.showSuccess(
                `${req.method} ${req.url} → Success (${event.status})`
              );
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          this.toast.showError(
            `${req.method} ${req.url} → Error (${error.status}): ${error.message}`
          );
        }
      })
    );
  }
}
