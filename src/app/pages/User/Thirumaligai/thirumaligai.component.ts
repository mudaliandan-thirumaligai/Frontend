import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { THIRUMALIGAIS } from './thirumaligai.data';

@Component({
  selector: 'app-thirumalagai',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageBreadcrumbComponent
  ],
  templateUrl: './thirumaligai.component.html',
  styleUrls: ['./thirumaligai.component.css']
})
export class ThirumalagaiComponent {
  thirumaligais = THIRUMALIGAIS;

}
