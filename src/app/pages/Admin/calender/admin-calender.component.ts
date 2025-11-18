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


import { ToastService } from '../../../shared/services/toast.service';

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
    KeyValuePipe,
    CommonModule,
    FullCalendarModule,
    ModalComponent
  ],
  templateUrl: './admin-calender.component.html',
  styles: ``
})
export class AdminCalenderComponent {

  constructor(private eventService: EventService, private toast: ToastService) {}
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
      left: 'prev,next addEventButton',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    selectable: true,
    allDayMaintainDuration: true,
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
        id: event.eventNumber.toString(),
        title: event.name,          
        start: event.startDate,     
        end: event.endDate,         
        extendedProps: {
          // TODO the api can be changed to the type of event also (in backednd and passed as payload )
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


  handleDateSelect(selectInfo: DateSelectArg) {
    this.resetModalFields();
    
    // Mark that this is a new event
    this.selectedEvent = null;
    
    // Populate date fields from selection
    this.eventStartDate = selectInfo.startStr.split('T')[0];
    this.eventEndDate = selectInfo.endStr ? selectInfo.endStr.split('T')[0] : this.eventStartDate;

    // Optional: default color/type
    this.eventLevel = 'Primary'; // or leave empty if user will select via radio

    this.openModal();
  }

  handleEventClick(clickInfo: EventClickArg) {
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


  // Update or Create Event
handleAddOrUpdateEvent() {
  const apiPayload: any = {
    eventNumber: this.eventNumber || this.selectedEvent?.extendedProps.eventNumber,
    name: this.eventTitle,
    description: this.eventDescription,
    startDate: new Date(this.eventStartDate),
    endDate: new Date(this.eventEndDate),
    location: this.eventLocation,
    tamilYear: this.eventTamilYear,
    tamilMonth: this.eventTamilMonth,
    eventLevel: this.eventLevel
  };

  if (this.selectedEvent) {
    // UPDATE
    console.log('Updating event:', apiPayload.eventNumber);
    this.eventService.updateEvent(apiPayload.eventNumber, apiPayload).subscribe({
      next: (updatedEvent) => {
        console.log('API update response:', updatedEvent);
        this.toast.showSuccess(`Event "${updatedEvent.name}" updated successfully!`);

        const calendarApi = this.calendarComponent.getApi();
        const existingEvent = calendarApi.getEventById(updatedEvent.eventNumber.toString());

        if (existingEvent) {
          existingEvent.setProp('title', updatedEvent.name);
          existingEvent.setStart(new Date(updatedEvent.startDate));
          existingEvent.setEnd(new Date(updatedEvent.endDate));
          existingEvent.setAllDay(true);
          existingEvent.setExtendedProp('calendar', this.eventLevel);
          existingEvent.setExtendedProp('description', updatedEvent.description);
          existingEvent.setExtendedProp('location', updatedEvent.location);
          existingEvent.setExtendedProp('tamilYear', updatedEvent.tamilYear);
          existingEvent.setExtendedProp('tamilMonth', updatedEvent.tamilMonth);
          existingEvent.setExtendedProp('eventNumber', Number(updatedEvent.eventNumber));
        }

        // Update local events array
        const index = this.events.findIndex(
          ev => ev.extendedProps.eventNumber === Number(updatedEvent.eventNumber)
        );
        if (index > -1) {
          this.events[index] = {
            ...this.events[index],
            title: updatedEvent.name,
            start: new Date(updatedEvent.startDate),
            end: new Date(updatedEvent.endDate),
            extendedProps: {
              ...this.events[index].extendedProps,
              calendar: this.eventLevel,
              description: updatedEvent.description,
              location: updatedEvent.location,
              tamilYear: updatedEvent.tamilYear,
              tamilMonth: updatedEvent.tamilMonth,
              eventNumber: Number(updatedEvent.eventNumber) // ensure number
            }
          };
        }


        this.closeModal();
        this.resetModalFields();
      },
      
      error: (err) => {console.error('Error updating event:', err);
        this.toast.showError(err?.error?.message || 'Failed to update event');
      }
      
    });
  } else {
    // CREATE
    console.log('Creating new event...');
    this.eventService.createEvent(apiPayload).subscribe({
  next: (createdEvent) => {
    console.log('API create response:', createdEvent);

    // Add toast message
    this.toast.showSuccess(`Event "${createdEvent.name}" created successfully!`);

    const newCalendarEvent: CalendarEvent = {
      id: createdEvent.eventNumber.toString(),
      title: createdEvent.name,
      start: new Date(createdEvent.startDate),
      end: new Date(createdEvent.endDate),
      allDay: true,
      extendedProps: {
        calendar: this.eventLevel,
        description: createdEvent.description,
        location: createdEvent.location,
        tamilYear: createdEvent.tamilYear,
        tamilMonth: createdEvent.tamilMonth,
        eventNumber: Number(createdEvent.eventNumber)
      }
    };

    this.events.push(newCalendarEvent);
    this.calendarComponent.getApi().addEvent(newCalendarEvent);

    this.closeModal();
    this.resetModalFields();
  },
    error: (err) => {
      console.error('Error creating event:', err);
      this.toast.showError(err?.error?.message || 'Failed to create event');
    }
  });
  }
}

// Delete Event
handleDeleteEvent() {
  if (!this.selectedEvent) return;

  const eventNumber = this.selectedEvent.extendedProps?.eventNumber;
  if (!eventNumber) {
    console.error('Cannot delete event: eventNumber is missing');
    this.toast.showError('Cannot delete event: event number is missing');
    return;
  }
  console.log(`Attempting to delete event with eventNumber: ${eventNumber}`);
  this.eventService.deleteEvent(eventNumber.toString()).subscribe({
    next: () => {
      // Remove from FullCalendar
      console.log(`API confirmed deletion of eventNumber: ${eventNumber}`);
      this.toast.showSuccess('Event deleted successfully!');
      const calendarApi = this.calendarComponent.getApi();
      const existingEvent = calendarApi.getEventById(eventNumber.toString());
      if (existingEvent) existingEvent.remove();

      // Remove from local events array
      this.events = this.events.filter(ev => ev.extendedProps.eventNumber !== eventNumber);

      this.closeModal();
      this.resetModalFields();
    },
    error: (err) => {console.error('Error deleting event:', err)
        // Prefer API message + details if available
        const apiMessage = err?.error?.message;
        const apiDetails = err?.error?.details;

        const toastMessage = apiMessage
          ? apiDetails
            ? `${apiMessage}: ${apiDetails}`
            : apiMessage
          : 'Failed to delete event';

        this.toast.showError(toastMessage);
    }
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