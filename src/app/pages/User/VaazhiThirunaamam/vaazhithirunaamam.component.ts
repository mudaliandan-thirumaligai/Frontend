import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { VaazhiThirunaamam } from './vaazhi-thirunaamam.model';
import { VAAZHI_THIRUNAAMAMS } from './vaazhi-thirunaamam.data';

@Component({
  selector: 'app-vaazhithirunaamam',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './vaazhithirunaamam.component.html',
   styleUrls: ['./vaazhithirunaamam.component.css']
})
export class VaazhithirunaamamComponent {
  vaazhiThirunaamams: VaazhiThirunaamam[] = VAAZHI_THIRUNAAMAMS;

}
