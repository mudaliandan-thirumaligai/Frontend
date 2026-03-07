import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-about-thirumaligai',
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
  ],
  templateUrl: './about-thirumaligai.component.html',
  styles: ``
})
export class AboutThirumaligaiComponent {

  showImageModal: boolean = false;

  openModal() {
    this.showImageModal = true;
  }

  closeModal() {
    this.showImageModal = false;
  }
  oldPhotosPdf = 'https://drive.google.com/file/d/1T_8CKbC5SbyhrGTntTuYraB7tHTy-Mt2/view?usp=drive_link';

  yatirajaPadukaPdf = 'https://drive.google.com/file/d/1Zyd5wkJJhraOIxTIZwSgPIAcgLkHmNKb/view?usp=drive_link';

  sadabhishekaPdf = 'https://drive.google.com/file/d/1Au45MErn2zPC2cZrPOEVWo41p_BF6N3s/view?usp=drive_link';

}
