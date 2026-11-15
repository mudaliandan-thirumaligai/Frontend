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
    googleDriveLink?: string;
    pathirikai?: string;
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
  styleUrls: ['./admin-calender.component.scss']
})
export class AdminCalenderComponent {

  constructor(private eventService: EventService, private toast: ToastService) { }
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
  eventGoogleDriveLink = '';
  eventPathirikaiLink = '';
  isOpen = false;


  calendarsEvents: Record<string, string> = {
    utsavam: 'danger',
    thirunakchathiram: 'success',
    theerthem: 'primary',
    others: 'warning'
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
         data.forEach(e => {
        console.log("API Event Date:", e.eventNumber, e.startDate, e.endDate);
      });
        const formattedEvents = data.map(event => {
          // Strip to YYYY-MM-DD so FullCalendar doesn't apply timezone shifts
          const startStr = event.startDate ? String(event.startDate).split('T')[0] : undefined;

          // Backend stores INCLUSIVE end date, but FullCalendar needs EXCLUSIVE.
          // Add 1 day so the calendar displays the event through the correct end date.
          let endStr: string | undefined = undefined;
          if (event.endDate) {
            const d = new Date(String(event.endDate).split('T')[0]);
            d.setDate(d.getDate() + 1);
            endStr = d.toISOString().split('T')[0];
          }

          return {
            id: event.eventNumber.toString(),
            title: event.name,
            start: startStr,
            end: endStr,
            extendedProps: {
              calendar: event.eventLevel || 'others',
              description: event.description,
              location: event.location,
              tamilYear: event.tamilYear,
              tamilMonth: event.tamilMonth,
              eventNumber: event.eventNumber,
              pathirikai: event.pathirikai,
              googleDriveLink: event.googleDriveLink
            }
          };
        });
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
        tamilMonth: event.extendedProps['tamilMonth'],
        pathirikai: event.extendedProps['pathirikai'],
        googleDriveLink: event.extendedProps['googleDriveLink']
      }
    };

    this.eventNumber = event.extendedProps['eventNumber'];
    this.eventTitle = event.title;
    this.eventStartDate = event.startStr.split('T')[0];
    // FullCalendar end is EXCLUSIVE — subtract 1 day to get the real end date
    if (event.endStr) {
      const exclusiveEnd = new Date(event.endStr.split('T')[0]);
      exclusiveEnd.setDate(exclusiveEnd.getDate() - 1);
      this.eventEndDate = exclusiveEnd.toISOString().split('T')[0];
    } else {
      this.eventEndDate = this.eventStartDate;
    }
    this.eventLevel = event.extendedProps['calendar'];
    this.eventDescription = event.extendedProps['description'] || '';
    this.eventLocation = event.extendedProps['location'] || '';
    this.eventTamilYear = event.extendedProps['tamilYear'] || '';
    this.eventTamilMonth = event.extendedProps['tamilMonth'] || '';
    this.eventGoogleDriveLink = event.extendedProps['googleDriveLink'] || '';
    this.eventPathirikaiLink = event.extendedProps['pathirikai'] || '';

    this.openModal();
  }


  // Update or Create Event
  handleAddOrUpdateEvent() {
     console.log("Selected Event:", this.selectedEvent);
    console.log("Raw Start Date from UI:", this.eventStartDate);
    console.log("Raw End Date from UI:", this.eventEndDate);

    const apiPayload: any = {
      eventNumber: this.eventNumber || this.selectedEvent?.extendedProps.eventNumber,
      name: this.eventTitle,
      description: this.eventDescription,
      // Send plain YYYY-MM-DD strings — avoids UTC offset causing date to flip
      startDate: this.eventStartDate || null,
      endDate: this.eventEndDate || null,
      location: this.eventLocation,
      tamilYear: this.eventTamilYear,
      tamilMonth: this.eventTamilMonth,
      eventLevel: this.eventLevel,
      googleDriveLink: this.eventGoogleDriveLink,
      pathirikai: this.eventPathirikaiLink
    };


  console.log("Final API Payload:", apiPayload);

    if (this.selectedEvent) {
      // UPDATE
      console.log('Updating event:', apiPayload.eventNumber);
      console.log("StartDate being sent:", apiPayload.startDate);
    console.log("EndDate being sent:", apiPayload.endDate);
      this.eventService.updateEvent(String(apiPayload.eventNumber), apiPayload).subscribe({
        next: (updatedEvent) => {
          console.log('API update response:', updatedEvent);
          this.toast.showSuccess(`Event "${updatedEvent.name}" updated successfully!`);

          const calendarApi = this.calendarComponent.getApi();
          const existingEvent = calendarApi.getEventById(String(updatedEvent.eventNumber));
          console.log("Looking for ID:", updatedEvent.eventNumber.toString());
          console.log("Found event:", existingEvent);

          // Strip dates to YYYY-MM-DD to avoid timezone shifts
          const startStr = updatedEvent.startDate ? String(updatedEvent.startDate).split('T')[0] : apiPayload.startDate;
          const endStr = updatedEvent.endDate ? String(updatedEvent.endDate).split('T')[0] : apiPayload.endDate;

          if (existingEvent) {
            existingEvent.setProp('title', updatedEvent.name);
            existingEvent.setStart(startStr);
            existingEvent.setEnd(endStr);
            existingEvent.setAllDay(true);
            existingEvent.setExtendedProp('calendar', this.eventLevel);
            existingEvent.setExtendedProp('description', updatedEvent.description);
            existingEvent.setExtendedProp('location', updatedEvent.location);
            existingEvent.setExtendedProp('tamilYear', updatedEvent.tamilYear);
            existingEvent.setExtendedProp('tamilMonth', updatedEvent.tamilMonth);
            existingEvent.setExtendedProp('eventNumber', Number(updatedEvent.eventNumber));
            existingEvent.setExtendedProp('googleDriveLink', updatedEvent.googleDriveLink || apiPayload.googleDriveLink);
            existingEvent.setExtendedProp('pathirikai', updatedEvent.pathirikai || apiPayload.pathirikai);
          }

          // Update local events array
          console.log("Updating local events array");
          const index = this.events.findIndex(
            ev => ev.extendedProps.eventNumber === Number(updatedEvent.eventNumber)
          );
          if (index > -1) {
            this.events[index] = {
              ...this.events[index],
              title: updatedEvent.name,
              start: startStr,
              end: endStr,
              extendedProps: {
                ...this.events[index].extendedProps,
                calendar: this.eventLevel,
                description: updatedEvent.description,
                location: updatedEvent.location,
                tamilYear: updatedEvent.tamilYear,
                tamilMonth: updatedEvent.tamilMonth,
                eventNumber: Number(updatedEvent.eventNumber),
                googleDriveLink: updatedEvent.googleDriveLink || apiPayload.googleDriveLink,
                pathirikai: updatedEvent.pathirikai || apiPayload.pathirikai
              }
            };
          }

          // Reload from API to ensure consistency on next page load
          this.loadEventsFromAPI();


          this.closeModal();
          this.resetModalFields();
        },

        error: (err) => {
          console.error('Error updating event:', err);
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

          // Strip dates to YYYY-MM-DD to avoid timezone shifts
          const createdStart = createdEvent.startDate ? String(createdEvent.startDate).split('T')[0] : apiPayload.startDate;
          const createdEnd = createdEvent.endDate ? String(createdEvent.endDate).split('T')[0] : apiPayload.endDate;

          const newCalendarEvent: CalendarEvent = {
            id: createdEvent.eventNumber.toString(),
            title: createdEvent.name,
            start: createdStart,
            end: createdEnd,
            allDay: true,
            extendedProps: {
              calendar: this.eventLevel,
              description: createdEvent.description,
              location: createdEvent.location,
              tamilYear: createdEvent.tamilYear,
              tamilMonth: createdEvent.tamilMonth,
              eventNumber: Number(createdEvent.eventNumber),
              pathirikai: createdEvent.pathirikai
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
      error: (err) => {
        console.error('Error deleting event:', err)
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
    this.eventGoogleDriveLink = '';
    this.eventPathirikaiLink = '';
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