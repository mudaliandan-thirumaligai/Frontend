import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
@Injectable({ providedIn: 'root' })
export class VisitorService {

  private baseUrl = environment.apiUrl;

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
