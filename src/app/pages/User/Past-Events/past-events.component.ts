import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService } from '../../../service/event.service';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
export interface CalendarEvent {
  id: string;
  eventNumber: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  tamilYear: string;
  tamilMonth: string;
  googleDriveLink?: string;
  eventLevel?: string;
}

@Component({
  selector: 'app-past-events',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './past-events.component.html',
  styleUrls: ['./past-events.component.css'],
  providers: [DatePipe]
})
export class PastEventsComponent implements OnInit {
  pastEvents: CalendarEvent[] = [];
  groupedEvents: Record<string, Record<string, CalendarEvent[]>> = {};
  years: string[] = []; // precomputed sorted years
  loading = true;
  errorMsg = '';

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadPastEvents();
  }

  async loadPastEvents() {
  try {
    const events = await this.eventService.getAllEvents().toPromise();

    if (!events) { // <-- handle undefined
      this.pastEvents = [];
      this.errorMsg = 'No past events found.';
      return;
    }

    const now = new Date();
    this.pastEvents = events.filter(e => e && new Date(e.endDate) < now);

    if (this.pastEvents.length === 0) {
      this.errorMsg = 'No past events found.';
    } else {
      this.groupByYearAndMonth();
    }
  } catch (err) {
    this.errorMsg = 'Failed to load past events.';
  } finally {
    this.loading = false;
  }
}

  groupByYearAndMonth() {
    this.groupedEvents = {};

    this.pastEvents.forEach(event => {
      const date = new Date(event.startDate);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!this.groupedEvents[year]) this.groupedEvents[year] = {};
      if (!this.groupedEvents[year][month]) this.groupedEvents[year][month] = [];

      this.groupedEvents[year][month].push(event);
    });

    // Precompute sorted years descending
    this.years = Object.keys(this.groupedEvents).sort((a, b) => Number(b) - Number(a));
  }

  monthsForYear(year: string) {
    return Object.keys(this.groupedEvents[year]);
  }
}
