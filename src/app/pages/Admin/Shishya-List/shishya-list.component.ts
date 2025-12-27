import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ContactService } from '../../../service/contact-us.service';
import { Contact } from './shishya.model';

@Component({
  selector: 'app-shishya-list',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    FormsModule,
    ModalComponent
  ],
  templateUrl: './shishya-list.component.html',
})
export class ShishyaListComponent implements OnInit {

  contacts: Contact[] = [];

  selectedContact: Contact | null = null;
  isModalOpen = false;
  isEditMode = false;

  // 🔹 Search & Filter
  searchTerm = '';
  selectedType = 'all';

  // 🔹 Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalRecords = 0;

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
    this.contactService.getPaginated({
      page: this.currentPage,
      limit: this.pageSize,
      search: this.searchTerm,
      type: this.selectedType,
    }).subscribe(res => {
      this.contacts = res.data;
      this.totalPages = res.totalPages;
      this.totalRecords = res.total;
    });
  }

  /* SEARCH / FILTER */
  onSearchChange(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  onTypeChange(): void {
    this.currentPage = 1;
    this.loadContacts();
  }

  /* PAGINATION */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadContacts();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadContacts();
    }
  }

  /* VIEW */
  viewContact(contact: Contact): void {
    this.selectedContact = { ...contact };
    this.isEditMode = false;
    this.isModalOpen = true;
  }

  /* EDIT */
  editContact(contact: Contact): void {
    this.selectedContact = { ...contact };
    this.isEditMode = true;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.selectedContact = null;
    this.isEditMode = false;
    this.isModalOpen = false;
  }

  saveChanges(): void {
    if (!this.selectedContact) return;

    this.contactService
      .update(this.selectedContact._id, this.selectedContact)
      .subscribe(() => {
        this.loadContacts();
        this.closeModal();
      });
  }

  deleteContact(id: string): void {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    this.contactService.delete(id).subscribe(() => {
      this.loadContacts();
    });
  }
}
