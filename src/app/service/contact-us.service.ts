import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact

 } from '../pages/Admin/Shishya-List/shishya.model';
@Injectable({ providedIn: 'root' })
export class ContactService {
  private baseUrl = 'http://localhost:8080'; // change as needed

  constructor(private http: HttpClient) {}

  submitContact(data: Contact): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  getPaginated(params: {
    page: number;
    limit: number;
    search?: string;
    type?: string;
  }) {
    return this.http.get<any>(`${this.baseUrl}/contact`, {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || '',
        type: params.type || '',
      },
    });
  }


  update(id: string, data: Partial<Contact>) {
    return this.http.put(`${this.baseUrl}/contact/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/contact/${id}`);
  }
}
