
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';

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
    ModalComponent
  ],
  templateUrl: './user-calender.component.html',
  styles: ``
})
export class UserCalenderComponent {

  constructor(private eventService: EventService) {}
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

  calendarsEvents: Record<string, string> = {
    Danger: 'danger',
    Success: 'success',
    Primary: 'primary',
    Warning: 'warning'
  };

  calendarOptions!: CalendarOptions;

  ngOnInit() {
  // 1. Initialize calendar options immediately
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
    events: [],  // <-- keep empty initially
    eventClick: (info) => this.handleEventClick(info),
    eventContent: (arg) => this.renderEventContent(arg)
  };

  // 2. Load API events
  this.loadEventsFromAPI();
}
loadEventsFromAPI() {
  this.eventService.getAllEvents().subscribe(
    (data: any[]) => {
      console.log('Fetched Events from API:', data);
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
      console.log('Formatted Events for Calendar:', formattedEvents);

      // Update only the events array - updating this should refresh the calendar
      this.calendarOptions.events = formattedEvents;
    },
    (error) => {
      console.error('Error fetching events:', error);
    }
  );
}

  handleEventClick(clickInfo: EventClickArg) {
    console.log("Event clicked:", clickInfo.event);
    const event = clickInfo.event;
    this.selectedEvent = {
      
      title: event.title,
      start: event.startStr,
      end: event.endStr,
      extendedProps: {
        eventNumber: event.extendedProps['eventNumber'], 
        calendar: event.extendedProps['calendar'],
        description: event.extendedProps['description'],
        location: event.extendedProps['location'],
        tamilYear: event.extendedProps['tamilYear'],
        tamilMonth: event.extendedProps['tamilMonth']
      }
    };

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

  openModal() {
    this.isOpen = true;
  }

  closeModal() {
    this.isOpen = false;
    this.resetModalFields();
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