import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VisitorService {

  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  registerVisit(visitorId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.baseUrl}/visitors/visit?id=${visitorId}`
    );
  }

  getCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.baseUrl}/visitors/count`
    );
  }
}
