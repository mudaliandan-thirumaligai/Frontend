import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarEvent } from '../shared/interfaces/calender-event.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = 'http://localhost:8080/events';
  //TODO REMOVE THIS TOKEN - JWT from ROLE
  private token = 'MY-TOKEN';
  
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      })
    };
  }

  constructor(private http: HttpClient) {}


   createEvent(eventData: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(this.baseUrl, eventData, this.getHttpOptions());
  }
  
  getAllEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(this.baseUrl);
  }

  getEventsByDate(formattedDate: string): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/date/${formattedDate}`);
  }
  getNextUpcomingEvent(): Observable<any> {
    return this.http.get(`${this.baseUrl}/next`);
  }
  updateEvent(id: string, eventData: Partial<CalendarEvent>): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.baseUrl}/${id}`, eventData, this.getHttpOptions());
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHttpOptions());
  }
}
