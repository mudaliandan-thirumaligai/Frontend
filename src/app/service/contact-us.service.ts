import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private baseUrl = 'http://localhost:8080/contact'; // change as needed

  constructor(private http: HttpClient) {}

  submitContact(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }
}
