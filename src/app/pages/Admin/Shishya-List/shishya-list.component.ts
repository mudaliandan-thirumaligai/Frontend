import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ModalComponent } from '../../../shared/components/ui/modal/modal.component';
import { ContactService } from '../../../service/contact-us.service';
import { Contact } from './shishya.model';
import { ToastService } from '../../../shared/services/toast.service';
import { exportToExcel } from './excel.utils';
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

  constructor(private contactService: ContactService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts(): void {
  this.contactService.getPaginated({
    page: this.currentPage,
    limit: this.pageSize,
    search: this.searchTerm,
    type: this.selectedType,
  }).subscribe({
    next: (res) => {
      this.contacts = res.data;
      this.totalPages = res.totalPages;
      this.totalRecords = res.total;
    },
    error: () => {
      this.toast.showError('Failed to load contacts. Please try again.');
    }
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
    this.toast.showInfo('Viewing contact details');
  }

  /* EDIT */
  editContact(contact: Contact): void {
    this.selectedContact = { ...contact };
    this.isEditMode = true;
    this.isModalOpen = true;
     this.toast.showInfo('Edit mode enabled');
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
      .subscribe({
        next: () => {
          this.toast.showSuccess('Contact updated successfully');
          this.loadContacts();
          this.closeModal();
        },
        error: (err) => {
          this.toast.showError(
            err?.error?.message || 'Failed to update contact'
          );
        }
      });
  }


  deleteContact(id: string): void {
  if (!confirm('Are you sure you want to delete this contact?')) {
    this.toast.showInfo('Deletion cancelled');
    return;
  }

  this.contactService.delete(id).subscribe({
    next: () => {
      this.toast.showSuccess('Contact deleted successfully');
      this.loadContacts();
    },
    error: (err) => {
      this.toast.showError(
        err?.error?.message || 'Failed to delete contact'
      );
    }
  });
}
  //  Export to Excel
  exportAllFiltered(): void {
  this.contactService.getPaginated({
    page: 1,
    limit: 10000,
    search: this.searchTerm,
    type: this.selectedType,
  }).subscribe({
    next: (res) => {
      if (!res.data || !res.data.length) {
        this.toast.showInfo('No data to export');
        return;
      }

      const excelData = res.data.map((c: any) => ({
        'Name': c.name,
        'Type': c.type,
        'Email': c.email,
        'Mobile': c.mobile || '',
        'WhatsApp Number': c.whatsappNumber || '',
        'Postal Address': c.postalAddress || '',
        'Query / Message': c.query || '',
        'Status': c.status || 'open',
        'Created At': c.createdAt
          ? new Date(c.createdAt).toLocaleString()
          : '',
        'Updated At': c.updatedAt
          ? new Date(c.updatedAt).toLocaleString()
          : '',
      }));

      exportToExcel(excelData, `shishya-list-${new Date().toISOString().split('T')[0]}`);
      this.toast.showSuccess('Excel downloaded successfully');
    },
    error: () => {
      this.toast.showError('Failed to export contacts');
    }
  });
}



}
