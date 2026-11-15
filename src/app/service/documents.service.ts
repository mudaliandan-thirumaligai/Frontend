import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface DocumentModel {
  _id: string;
  title: string;
  language: string;
  url: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentsService {
  private API = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(this.API);
  }

  create(doc: Partial<DocumentModel>): Observable<DocumentModel> {
    return this.http.post<DocumentModel>(this.API, doc);
  }

  update(id: string, doc: Partial<DocumentModel>): Observable<DocumentModel> {
    return this.http.patch<DocumentModel>(`${this.API}/${id}`, doc);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

}
