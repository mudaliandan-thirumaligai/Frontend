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
    pathirikai?: string;
    eventNumber?: number;
  };
}

type EventColor = 'danger' | 'success' | 'primary' | 'warning';

@Component({
  selector: 'app-calender',
  standalone: true,
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
  eventPathirikaiLink = '';
  isOpen = false;
  displayPromptBanner = false;

  calendarOptions!: CalendarOptions;

  private targetDateFromRoute: string | null = null;
  private highlightEventId: string | null = null;
  private showEventPrompt = false;

  ngOnInit() {

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

    // Read params from landing page
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.targetDateFromRoute = params['date'];
      }

      if (params['highlightEvent']) {
        this.highlightEventId = params['highlightEvent'];
      }

      if (params['showPrompt'] === 'true') {
        this.showEventPrompt = true;
      }
    });

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
          googleDriveLink: event.googleDriveLink,
          pathirikai: event.pathirikai,
          eventNumber: event.eventNumber
        }
      }));

      this.calendarOptions.events = formattedEvents;

      setTimeout(() => {

        const calendarApi = this.calendarComponent.getApi();

        if (this.targetDateFromRoute) {
          calendarApi.gotoDate(this.targetDateFromRoute);
        }

        // Highlight event if ID provided
        if (this.highlightEventId) {

          const event = calendarApi.getEventById(this.highlightEventId);

          if (event) {

            const el = document.querySelector(
              `[data-event-id="${this.highlightEventId}"]`
            );

            if (el) {
              el.classList.add('highlight-event');
            }

            // Optional: automatically open modal
            this.handleEventClick({ event } as any);
          }
        }

        if (this.showEventPrompt) {
          this.showEventClickPrompt();
        }

      }, 200);

    },
    (error) => {
      console.error('Error fetching events:', error);
    });

  }

  goToEventMonth(date: string) {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.gotoDate(date);
  }

  showEventClickPrompt(): void {
    // Show a dismissible banner instead of alert
    this.displayPromptBanner = true;
    // Auto-hide after 10 seconds if not dismissed
    setTimeout(() => {
      this.displayPromptBanner = false;
    }, 10000);
  }

  dismissPrompt(): void {
    this.displayPromptBanner = false;
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
    this.eventPathirikaiLink = event.extendedProps['pathirikai'] || '';

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

  openPathirikai() {
    if (!this.eventPathirikaiLink) return;
    window.open(this.eventPathirikaiLink, '_blank', 'noopener');
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
    this.eventGoogleDriveLink = '';
    this.eventPathirikaiLink = '';
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