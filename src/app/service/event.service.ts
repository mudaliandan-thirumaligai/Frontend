import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CalendarEvent } from '../shared/interfaces/calender-event.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = 'http://localhost:8080/events';

  constructor(private http: HttpClient) {}

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
    return this.http.put<CalendarEvent>(`${this.baseUrl}/${id}`, eventData);
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
