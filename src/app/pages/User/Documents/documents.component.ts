import { CommonModule } from '@angular/common';
import { Component} from '@angular/core';

import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';


@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent {
  // 🔹 Add your documents here
  documents = [
    {
      title: 'Aarthi Prabandham',
      language: 'Tamil',
      url: 'documents/SreeMudhaliandanThirumaligai-AarthiPrabandham.pdf'
    },
    {
      title: 'DhattiPanchakam',
      language: 'English',
      url: 'documents/SreeMudhaliandanThirumaligai-DhattiPanchakam - English.pdf'
    }
  ];
  
}

