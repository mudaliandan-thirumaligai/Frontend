import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DocumentModel, DocumentsService } from '../../../service/documents.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: DocumentModel[] = [];
  searchTerm: string = '';
  selectedLanguage: string = '';

  // Languages list for filter
  languages: string[] = ['English', 'Tamil', 'Sanskrit'];

  constructor(private documentsService: DocumentsService) {}

  ngOnInit() {
    this.documentsService.getAll().subscribe(data => {
      this.documents = data;
    });
  }

  get filteredDocuments(): DocumentModel[] {
    return this.documents.filter(doc => {
      const matchesName =
        !this.searchTerm ||
        doc.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesLanguage =
        !this.selectedLanguage ||
        doc.language === this.selectedLanguage;

      return matchesName && matchesLanguage;
    });
  }
}
