import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { EventInput, CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
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
    eventNumber?: string;
  };
}

@Component({
  selector: 'app-calender',
  imports: [
    FormsModule,
    KeyValuePipe,
    CommonModule,
    FullCalendarModule,
    ModalComponent
  ],
  templateUrl: './admin-calender.component.html',
  styles: ``
})
export class AdminCalenderComponent {

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
    Danger: 'Red',
    Success: 'Green',
    Primary: 'Blue',
    Warning: 'Orange'
  };

  calendarOptions!: CalendarOptions;

  ngOnInit() {
  // 1. Initialize calendar options immediately
  this.calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next addEventButton',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    events: [],  // <-- keep empty initially
    select: (info) => this.handleDateSelect(info),
    eventClick: (info) => this.handleEventClick(info),
    customButtons: {
      addEventButton: {
        text: 'Add Event +',
        click: () => this.openModal()
      }
    },
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
        title: event.name,          
        start: event.startDate,     
        end: event.endDate,         
        extendedProps: {
          description: event.description,
          location: event.location,
          tamilYear: event.tamilYear,
          tamilMonth: event.tamilMonth,
          eventNumber: event.eventNumber
        }
      }));
      console.log('Formatted Events for Calendar:', formattedEvents);

      // Update only the events array
      this.calendarOptions.events = formattedEvents;
    },
    (error) => {
      console.error('Error fetching events:', error);
    }
  );
}


  handleDateSelect(selectInfo: DateSelectArg) {
    this.resetModalFields();
    this.eventStartDate = selectInfo.startStr;
    this.eventEndDate = selectInfo.endStr || selectInfo.startStr;
    this.openModal();
  }

  handleEventClick(clickInfo: EventClickArg) {
  const event = clickInfo.event;

  this.selectedEvent = {
    eventNumber: event.extendedProps['eventNumber'], // ✅ access here
    title: event.title,
    start: event.startStr,
    end: event.endStr,
    extendedProps: {
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


  handleAddOrUpdateEvent() {
  // Prepare API payload
  const apiPayload: any = {
    eventNumber: this.selectedEvent?.extendedProps.eventNumber || Date.now().toString(), // generate if new
    name: this.eventTitle,
    description: this.eventDescription,
    startDate: new Date(this.eventStartDate),
    endDate: new Date(this.eventEndDate),
    location: this.eventLocation,
    tamilYear: this.eventTamilYear,
    tamilMonth: this.eventTamilMonth
  };

  if (this.selectedEvent) {
    // UPDATE
    this.eventService.updateEvent(apiPayload.eventNumber, apiPayload).subscribe({
      next: (updatedEvent) => {
        // Map updated event back to CalendarEvent for frontend
        const updatedCalendarEvent: CalendarEvent = {
          id: updatedEvent.eventNumber,
          title: updatedEvent.name,
          start: updatedEvent.startDate,
          end: updatedEvent.endDate,
          extendedProps: {
            calendar: this.eventLevel,
            description: updatedEvent.description,
            location: updatedEvent.location,
            tamilYear: updatedEvent.tamilYear,
            tamilMonth: updatedEvent.tamilMonth,
            eventNumber: updatedEvent.eventNumber
          }
        };

        this.events = this.events.map(ev =>
          ev.extendedProps.eventNumber === updatedCalendarEvent.extendedProps.eventNumber
            ? updatedCalendarEvent
            : ev
        );

        this.calendarOptions.events = this.events;
        this.closeModal();
        this.resetModalFields();
      },
      error: (err) => console.error('Error updating event:', err)
    });
  } else {
    // CREATE
    this.eventService.createEvent(apiPayload).subscribe({
      next: (createdEvent) => {
        const newCalendarEvent: CalendarEvent = {
          id: createdEvent.eventNumber,
          title: createdEvent.name,
          start: createdEvent.startDate,
          end: createdEvent.endDate,
          extendedProps: {
            calendar: this.eventLevel,
            description: createdEvent.description,
            location: createdEvent.location,
            tamilYear: createdEvent.tamilYear,
            tamilMonth: createdEvent.tamilMonth,
            eventNumber: createdEvent.eventNumber
          }
        };

        this.events = [...this.events, newCalendarEvent];
        this.calendarOptions.events = this.events;
        this.closeModal();
        this.resetModalFields();
      },
      error: (err) => console.error('Error creating event:', err)
    });
  }
}




  // Delete existing event
  handleDeleteEvent() {
    if (!this.selectedEvent) return;

    this.eventService.deleteEvent(this.selectedEvent["eventNumber"].toString())
      .subscribe({
        next: () => {
          // Remove from local events array
          this.events = this.events.filter(ev => ev["eventNumber"] !== this.selectedEvent!["eventNumber"]);
          this.calendarOptions.events = this.events;
          this.closeModal();
          this.resetModalFields();
        },
        error: (err) => console.error('Error deleting event:', err)
      });
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