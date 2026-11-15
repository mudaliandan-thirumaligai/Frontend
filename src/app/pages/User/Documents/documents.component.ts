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

  // Dynamically populated languages
  languages: string[] = [];

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.documentsService.getAll().subscribe(data => {
      this.documents = data;
      this.extractLanguages();
    });
  }

  // Extract unique languages from API response
  private extractLanguages(): void {
    const languageSet = new Set<string>();

    this.documents.forEach(doc => {
      if (doc.language) {
        languageSet.add(doc.language);
      }
    });

    this.languages = Array.from(languageSet).sort();
  }
  openDocument(url: string) {
    window.open(url, '_blank');
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
