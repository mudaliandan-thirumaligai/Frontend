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
    eventNumber?: number;
  };
}

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

  eventTitle = '';
  eventNumber = 0;
  eventDescription = '';
  eventLocation = '';
  eventTamilYear = '';
  eventTamilMonth = '';
  eventStartDate = '';
  eventEndDate = '';
  eventLevel = '';
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
    this.eventService.getAllEvents().subscribe(
      (data: any[]) => {
        const formattedEvents = data.map(event => ({
          id: event.eventNumber.toString(),
          title: event.name,
          start: event.startDate,
          end: event.endDate,
          extendedProps: {
            calendar: event.eventLevel || 'Primary',
            description: event.description,
            location: event.location,
            tamilYear: event.tamilYear,
            tamilMonth: event.tamilMonth,
            eventNumber: event.eventNumber
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

    this.openModal();
  }

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
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
    const colorClass = `fc-bg-${eventInfo.event.extendedProps.calendar?.toLowerCase()}`;
    return {
      html: `
        <div class="event-fc-color flex fc-event-main ${colorClass} p-1 rounded-sm">
          <div class="fc-daygrid-event-dot"></div>
          <div class="fc-event-time">${eventInfo.timeText || ''}</div>
          <div class="fc-event-title">${eventInfo.event.title}</div>
        </div>
      `
    };
  }
}
