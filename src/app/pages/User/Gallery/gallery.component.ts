import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-gallery',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './gallery.component.html',
  styles: ``
})
export class GalleryComponent {

}
