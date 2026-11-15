import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';


@Component({
  selector: 'app-about-swamy',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PageBreadcrumbComponent],
  templateUrl: './about-swamy.component.html',
  styleUrls: ['./about-swamy.component.css']
})
export class AboutSwamyComponent {
  
}

