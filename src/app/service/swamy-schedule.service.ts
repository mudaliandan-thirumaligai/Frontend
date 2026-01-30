import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface ScheduleModel {
  _id?: string;
  startDate: string;
  endDate: string;
  place: string;
  address?: string;
  contact?: string;
}


@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private baseUrl = environment.apiUrl + '/schedule'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<ScheduleModel[]> {
    return this.http.get<ScheduleModel[]>(this.baseUrl);
  }

  create(data: Partial<ScheduleModel>): Observable<ScheduleModel> {
    return this.http.post<ScheduleModel>(this.baseUrl, data);
  }

  update(id: string, data: Partial<ScheduleModel>): Observable<ScheduleModel> {
    return this.http.patch<ScheduleModel>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
  }
}
