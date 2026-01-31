import { Component } from '@angular/core';
import { AcharyaPage } from './acharya-page.interface';
import { ACHARYANS } from './aachariyas.data';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-acharyan-page',
  imports: [PageBreadcrumbComponent, CommonModule],
  templateUrl: './aachariyas.component.html',
  styleUrls: ['./aachariyas.component.css']
})
export class AcharyanPageComponent {
  acharyans: AcharyaPage[] = ACHARYANS;

  // Default selected Acharyan
  selected: AcharyaPage = this.acharyans[0];

  selectAcharya(a: AcharyaPage) {
    this.selected = a;
  }
}
