import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService } from '../../../service/event.service'; // adjust path
import { HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
@Component({
  selector: 'app-past-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, DatePipe, PageBreadcrumbComponent],  // include what you need
  templateUrl: './past-events.component.html',
  styleUrls: ['./past-events.component.css'],           // use .css instead of .scss
})
export class PastEventsComponent {
  pastEvents: any[] = [];
  loading = true;
  errorMsg = '';

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadPastEvents();
  }

  loadPastEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (events: any[]) => {
        const now = new Date();
        this.pastEvents = events
          .map(ev => ({
            ...ev,
            startDate: new Date(ev.startDate),
            endDate: new Date(ev.endDate)
          }))
          .filter(ev => ev.endDate < now); // Only past events

        this.loading = false;
        if (!this.pastEvents.length) {
          this.errorMsg = 'No past events found';
        }
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error fetching events';
      }
    });
  }
}
