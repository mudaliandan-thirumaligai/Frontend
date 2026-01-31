import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-page-breadcrumb',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './page-breadcrumb.component.html',
})
export class PageBreadcrumbComponent {
  @Input() pageTitle = '';

  @Input() parentLabel?: string;
  @Input() parentLink?: string;
}
