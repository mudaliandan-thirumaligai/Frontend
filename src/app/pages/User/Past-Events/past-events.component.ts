import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { EventService } from '../../../service/event.service';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-past-events',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './past-events.component.html',
  styleUrls: ['./past-events.component.css']
})
export class PastEventsComponent {
   pastEvents: any[] = [];
  searchText = '';

  constructor(private eventService: EventService) {}

}

