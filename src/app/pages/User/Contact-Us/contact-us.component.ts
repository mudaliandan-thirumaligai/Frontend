import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-blank',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './contact-us.component.html',
  styles: ``
})
export class ContactUsComponent {

}
