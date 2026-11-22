import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
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

const MOBILE_BREAKPOINT = 768;

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
export class UserCalenderComponent implements OnInit {

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

  // ---------- Mobile agenda state ----------
  isMobile = false;
  selectedDateStr: string | null = null;     // 'YYYY-MM-DD' when a day is tapped
  visibleMonthLabel = '';                    // 'YYYY-MM-01' of the month in view
  agendaEvents: CalendarEvent[] = [];
  nextEvent: CalendarEvent | null = null;
  private allEvents: CalendarEvent[] = [];
  private visibleMonthStart = '';            // inclusive
  private visibleMonthEnd = '';              // exclusive

  calendarOptions!: CalendarOptions;

  private targetDateFromRoute: string | null = null;
  private highlightEventId: string | null = null;
  private showEventPrompt = false;

  ngOnInit() {

    this.isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    this.calendarOptions = this.buildCalendarOptions();

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

  // Switch layout if the screen crosses the breakpoint (rotate / resize)
  @HostListener('window:resize')
  onResize() {
    const nowMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (nowMobile !== this.isMobile) {
      this.isMobile = nowMobile;
      this.selectedDateStr = null;
      this.calendarOptions = {
        ...this.buildCalendarOptions(),
        events: this.calendarOptions.events
      };
      this.refreshAgenda();
    }
  }

  private buildCalendarOptions(): CalendarOptions {

    const base: CalendarOptions = {
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

    if (!this.isMobile) {
      return base;
    }

    // Mobile: compact month grid (colored markers only), tap a date -> agenda below
    return {
      ...base,
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'today'
      },
      contentHeight: 'auto',
      aspectRatio: 1,
      dayMaxEvents: 2,
      dateClick: (info) => this.onDateClick(info.dateStr),
      moreLinkClick: (arg) => {
        this.onDateClick(this.toISO(arg.date));
      },
      datesSet: (arg) => this.onDatesSet(arg.view.currentStart, arg.view.currentEnd)
    };
  }

  loadEventsFromAPI() {

    this.eventService.getAllEvents().subscribe((data: any[]) => {

      const formattedEvents: CalendarEvent[] = data.map(event => ({
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

      this.allEvents = formattedEvents;
      this.calendarOptions.events = formattedEvents;
      this.refreshAgenda();

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

    // Mobile: just the colored marker (the title lives in the agenda cards below)
    if (this.isMobile) {
      return {
        html: `
          <div class="event-fc-color fc-bg-${mappedColor} flex items-center justify-center p-1 rounded-sm">
            <span class="fc-daygrid-event-dot"></span>
          </div>
        `
      };
    }

    return {
      html: `
        <div class="event-fc-color fc-bg-${mappedColor} flex items-center gap-1 p-1 rounded-sm">
          <span class="fc-daygrid-event-dot"></span>
          <span class="fc-event-title">${eventInfo.event.title}</span>
        </div>
      `
    };
  }

  // =====================================================
  // MOBILE AGENDA
  // =====================================================

  onDateClick(dateStr: string) {
    this.selectedDateStr = dateStr.split('T')[0];
    this.refreshAgenda();
  }

  onDatesSet(start: Date, end: Date) {
    this.visibleMonthStart = this.toISO(start);
    this.visibleMonthEnd = this.toISO(end);
    this.visibleMonthLabel = this.visibleMonthStart;
    // moving to another month resets the day filter
    if (this.selectedDateStr &&
        (this.selectedDateStr < this.visibleMonthStart || this.selectedDateStr >= this.visibleMonthEnd)) {
      this.selectedDateStr = null;
    }
    // avoid ExpressionChanged errors: datesSet fires during change detection
    Promise.resolve().then(() => this.refreshAgenda());
  }

  clearSelectedDate() {
    this.selectedDateStr = null;
    this.calendarComponent?.getApi().unselect();
    this.refreshAgenda();
  }

  refreshAgenda() {

    const sorted = [...this.allEvents].sort((a, b) =>
      this.dayOf(a.start).localeCompare(this.dayOf(b.start)));

    if (this.selectedDateStr) {
      const d = this.selectedDateStr;
      this.agendaEvents = sorted.filter(ev => {
        const s = this.dayOf(ev.start);
        const e = ev.end ? this.dayOf(ev.end) : '';
        return e ? (s <= d && d < e) : s === d;   // end date is exclusive
      });
    } else if (this.visibleMonthStart) {
      const ms = this.visibleMonthStart;
      const me = this.visibleMonthEnd;
      this.agendaEvents = sorted.filter(ev => {
        const s = this.dayOf(ev.start);
        const e = ev.end ? this.dayOf(ev.end) : '';
        return e ? (s < me && e > ms) : (s >= ms && s < me);
      });
    } else {
      this.agendaEvents = [];
    }

    // next event after the day being viewed (or after today)
    const from = this.selectedDateStr || this.toISO(new Date());
    this.nextEvent = sorted.find(ev => this.dayOf(ev.start) > from) || null;
  }

  jumpToNextEvent() {
    if (!this.nextEvent) return;
    const day = this.dayOf(this.nextEvent.start);
    const api = this.calendarComponent.getApi();
    api.gotoDate(day);
    api.select(day);
    this.selectedDateStr = day;
    this.refreshAgenda();
  }

  openFromAgenda(ev: CalendarEvent) {
    const props = ev.extendedProps;
    this.eventNumber = props.eventNumber ?? 0;
    this.eventTitle = (ev.title as string) || '';
    this.eventStartDate = this.dayOf(ev.start);
    this.eventEndDate = ev.end ? this.dayOf(ev.end) : '';
    this.eventLevel = props.calendar;
    this.eventDescription = props.description || '';
    this.eventLocation = props.location || '';
    this.eventTamilYear = props.tamilYear || '';
    this.eventTamilMonth = props.tamilMonth || '';
    this.eventGoogleDriveLink = props.googleDriveLink || '';
    this.eventPathirikaiLink = props.pathirikai || '';
    this.openModal();
  }

  colorFor(ev: CalendarEvent): EventColor {
    return this.calendarsEvents[ev.extendedProps.calendar] || 'warning';
  }

  // multi-day if the (exclusive) end is more than one day after the start
  isMultiDay(ev: CalendarEvent): boolean {
    return !!ev.end && this.dayOf(ev.end) > this.addDays(this.dayOf(ev.start), 1);
  }

  lastDayOf(ev: CalendarEvent): string {
    return ev.end ? this.addDays(this.dayOf(ev.end), -1) : this.dayOf(ev.start);
  }

  // ---------- helpers ----------
  private dayOf(value: any): string {
    if (!value) return '';
    if (value instanceof Date) return this.toISO(value);
    return String(value).split('T')[0];
  }

  private toISO(d: Date): string {
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private addDays(iso: string, n: number): string {
    const [y, m, d] = iso.split('-').map(Number);
    return this.toISO(new Date(y, m - 1, d + n));
  }

}