import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ActivatedRoute } from '@angular/router';

import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EventService } from '../../../service/event.service';

interface CalendarEvent extends EventInput {
  extendedProps: {
    calendar: string;
    description?: string;
    location?: string;
    tamilYear?: string;
    tamilMonth?: string;
    googleDriveLink?: string;
    eventNumber?: number;
  };
}
type EventColor = 'danger' | 'success' | 'primary' | 'warning';


@Component({
  selector: 'app-calender',
  imports: [
    FormsModule,
    CommonModule,
    FullCalendarModule,
    ModalComponent,
    PageBreadcrumbComponent
  ],
  templateUrl: './user-calender.component.html',
  styles: ``
})
export class UserCalenderComponent {

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {}

  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  events: CalendarEvent[] = [];
  selectedEvent: CalendarEvent | null = null;

  calendarsEvents: Record<string, EventColor> = {
    utsavam: 'danger',
    thirunakchathiram: 'success',
    theerthem: 'primary',
    others: 'warning'
  };

  eventTitle = '';
  eventNumber = 0;
  eventDescription = '';
  eventLocation = '';
  eventTamilYear = '';
  eventTamilMonth = '';
  eventStartDate = '';
  eventEndDate = '';
  eventLevel = '';
  eventGoogleDriveLink = '';
  isOpen = false;

  calendarOptions!: CalendarOptions;

  private targetDateFromRoute: string | null = null;

  ngOnInit() {
    // 🔹 Calendar configuration
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: true,
      allDayMaintainDuration: true,
      height: 'auto',
      contentHeight: 500,
      aspectRatio: 1.4,
      events: [],
      eventClick: (info) => this.handleEventClick(info),
      eventContent: (arg) => this.renderEventContent(arg)
    };

    // 🔹 Read date from landing page
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.targetDateFromRoute = params['date'];
      }
    });

    // 🔹 Load events
    this.loadEventsFromAPI();
  }

  loadEventsFromAPI() {
  this.eventService.getAllEvents().subscribe((data: any[]) => {
    const formattedEvents: EventInput[] = data.map(event => ({
      id: event.eventNumber.toString(),
      title: event.name,
      start: event.startDate,
      end: event.endDate,
      allDay: true,
      extendedProps: {
        calendar: event.eventLevel || 'others',
        description: event.description,
        location: event.location,
        tamilYear: event.tamilYear,
        tamilMonth: event.tamilMonth,
        googleDriveLink: event.googleDriveLink
      }
    }));

    this.calendarOptions.events = formattedEvents;

        // 🔹 Jump to event month if coming from landing page
        if (this.targetDateFromRoute) {
          setTimeout(() => {
            this.goToEventMonth(this.targetDateFromRoute!);
          });
        }
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  // 🔹 Navigate calendar to event month
  goToEventMonth(date: string) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(date);
  }

  handleEventClick(clickInfo: EventClickArg) {
    const event = clickInfo.event;

    this.eventNumber = event.extendedProps['eventNumber'];
    this.eventTitle = event.title;
    this.eventStartDate = event.startStr.split('T')[0];
    this.eventEndDate = event.endStr ? event.endStr.split('T')[0] : '';
    this.eventLevel = event.extendedProps['calendar'];
    this.eventDescription = event.extendedProps['description'] || '';
    this.eventLocation = event.extendedProps['location'] || '';
    this.eventTamilYear = event.extendedProps['tamilYear'] || '';
    this.eventTamilMonth = event.extendedProps['tamilMonth'] || '';
    this.eventGoogleDriveLink = event.extendedProps['googleDriveLink'] || '';

    this.openModal();
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
  }
  openGoogleDrive() {
    if (!this.eventGoogleDriveLink) return;
    window.open(this.eventGoogleDriveLink, '_blank', 'noopener');
  }


  resetModalFields() {
    this.eventTitle = '';
    this.eventStartDate = '';
    this.eventEndDate = '';
    this.eventLevel = '';
    this.eventDescription = '';
    this.eventLocation = '';
    this.eventTamilYear = '';
    this.eventTamilMonth = '';
    this.selectedEvent = null;
  }

  renderEventContent(eventInfo: any) {
    const level = eventInfo.event.extendedProps.calendar || 'others';
    const mappedColor = this.calendarsEvents[level] || 'warning';

    return {
      html: `
        <div class="event-fc-color fc-bg-${mappedColor} flex items-center gap-1 p-1 rounded-sm">
          <span class="fc-daygrid-event-dot"></span>
          <span class="fc-event-title">${eventInfo.event.title}</span>
        </div>
      `
    };
  }

}
