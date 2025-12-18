import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

interface Folder {
  name: string;
  images: string[];
  expanded: boolean;
}

@Component({
  selector: 'app-about-swamy',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './about-swamy.component.html',
  styleUrls: ['./about-swamy.component.css']
})
export class AboutSwamyComponent {
  
}

