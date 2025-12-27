import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CalendarEvent } from '../shared/interfaces/calender-event.interface';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
@Injectable({ providedIn: 'root' })
export class EventService {

  private baseUrl = environment.apiUrl + '/events';
  constructor(private http: HttpClient) {}

  createEvent(eventData: Partial<CalendarEvent>) {
    return this.http.post<CalendarEvent>(this.baseUrl, eventData);
  }

  getAllEvents() {
    return this.http.get<CalendarEvent[]>(this.baseUrl);
  }

  getEventsByDate(formattedDate: string) {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/date/${formattedDate}`);
  }

  getNextUpcomingEvent() {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/next`);
  }

  getPastEvents() {
    return this.http.get<CalendarEvent[]>(`${this.baseUrl}/past`);
  }

  updateEvent(id: string, eventData: Partial<CalendarEvent>) {
    return this.http.put<CalendarEvent>(`${this.baseUrl}/${id}`, eventData);
  }

  deleteEvent(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}

