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
  years: string[] = [];
  loading = true;
  errorMsg = '';

  expandedYears: Record<string, boolean> = {};
  expandedMonths: Record<string, Record<string, boolean>> = {};

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadPastEvents();
  }

  async loadPastEvents() {
    try {
      const events = await this.eventService.getAllEvents().toPromise();

      if (!events) {
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

    // Sort years descending
    this.years = Object.keys(this.groupedEvents).sort((a, b) => Number(b) - Number(a));

    // Sort months ascending
    this.years.forEach(year => {
      const months = Object.keys(this.groupedEvents[year]).sort((a, b) => 
        new Date(`${a} 1, 2000`).getMonth() - new Date(`${b} 1, 2000`).getMonth()
      );
      const sortedGroup: Record<string, CalendarEvent[]> = {};
      months.forEach(m => sortedGroup[m] = this.groupedEvents[year][m]);
      this.groupedEvents[year] = sortedGroup;
    });

    // Initialize expanded states
    this.years.forEach(year => {
      this.expandedYears[year] = false;
      this.expandedMonths[year] = {};
      Object.keys(this.groupedEvents[year]).forEach(month => {
        this.expandedMonths[year][month] = false;
      });
    });
  }

  monthsForYear(year: string) {
    return Object.keys(this.groupedEvents[year]);
  }

  toggleYear(year: string) {
    this.expandedYears[year] = !this.expandedYears[year];
  }

  toggleMonth(year: string, month: string) {
    this.expandedMonths[year][month] = !this.expandedMonths[year][month];
  }
}
