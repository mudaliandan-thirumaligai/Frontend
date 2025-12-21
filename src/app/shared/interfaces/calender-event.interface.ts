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
  googleDriveLink?: string; // optional
  eventLevel?: string;      // optional
}
