import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DocumentModel, DocumentsService } from '../../../service/documents.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: DocumentModel[] = [];

  constructor(private documentsService: DocumentsService) {}

  ngOnInit() {
    this.documentsService.getAll().subscribe(data => {
      this.documents = data;
    });
  }
}
