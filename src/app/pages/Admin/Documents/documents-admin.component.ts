import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DocumentsService, DocumentModel } from '../../../service/documents.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-documents-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, PageBreadcrumbComponent],
  templateUrl: './documents-admin.component.html'
})
export class DocumentsComponentAdmin implements OnInit {

  documents: DocumentModel[] = [];
  editingDocumentId: string | null = null;
  editedData: Partial<DocumentModel> = {};
  searchTerm = '';
  selectedLanguage: string = '';
  languages: string[] = ['English', 'Tamil', 'Sanskrit','Others'];

  addingNewDocument = false;
  newDocumentData: Partial<DocumentModel> = {};

  constructor(
    private documentsService: DocumentsService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  get availableLanguages(): string[] {
    const langs = this.documents
      .map(d => d.language)
      .filter(l => !!l) as string[];

    return Array.from(new Set(langs));
  }


  loadDocuments(): void {
    this.documentsService.getAll().subscribe({
      next: data => this.documents = data,
      error: () => this.toast.showError('Failed to load documents')
    });
  }

  startEdit(doc: DocumentModel): void {
    this.editingDocumentId = doc._id || null;
    this.editedData = { ...doc };
  }

  cancelEdit(): void {
    this.editingDocumentId = null;
    this.editedData = {};
  }

  saveEdit(): void {
    if (!this.editingDocumentId) return;

    this.toast.showInfo('Updating document...');

    this.documentsService.update(this.editingDocumentId, this.editedData)
      .subscribe({
        next: updated => {
          const idx = this.documents.findIndex(d => d._id === updated._id);
          if (idx !== -1) this.documents[idx] = updated;
          this.toast.showSuccess('Document updated');
          this.cancelEdit();
        },
        error: () => this.toast.showError('Update failed')
      });
  }

  deleteDocument(doc: DocumentModel): void {
    if (!doc._id || !confirm(`Delete "${doc.title}"?`)) return;

    this.toast.showInfo('Deleting document...');

    this.documentsService.delete(doc._id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d._id !== doc._id);
        this.toast.showSuccess('Document deleted');
      },
      error: () => this.toast.showError('Delete failed')
    });
  }

  startAddNewDocument(): void {
    this.addingNewDocument = true;
    this.newDocumentData = {};
  }

  cancelAddNewDocument(): void {
    this.addingNewDocument = false;
    this.newDocumentData = {};
  }

  saveNewDocument(): void {
    if (!this.newDocumentData.title || !this.newDocumentData.url) {
      this.toast.showError('Title and URL are required');
      return;
    }

    this.toast.showInfo('Adding document...');

    this.documentsService.create(this.newDocumentData).subscribe({
      next: doc => {
        this.documents.unshift(doc);
        this.toast.showSuccess('Document added');
        this.cancelAddNewDocument();
      },
      error: () => this.toast.showError('Create failed')
    });
  }
  openDocument(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }


  get filteredDocuments(): DocumentModel[] {
    return this.documents.filter(doc => {
      const matchesSearch =
        !this.searchTerm ||
        doc.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesLanguage =
        !this.selectedLanguage ||
        doc.language === this.selectedLanguage;

      return matchesSearch && matchesLanguage;
    });
  }

}
