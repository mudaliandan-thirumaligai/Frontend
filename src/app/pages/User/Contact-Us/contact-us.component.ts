import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../service/contact-us.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service'; // <-- import ToastService
import { Router } from '@angular/router';
@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ReactiveFormsModule
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: `./contact-us.component.css`
})
export class ContactUsComponent {
  contactForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toast: ToastService, 
    private router: Router
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      mobile: [''],
      email: ['', [Validators.required, Validators.email]],
      whatsappNumber: [''],
      postalAddress: [''],
    });
  }

  submitForm() {
    if (this.contactForm.invalid) {
      this.toast.showError('Please fill in all required fields'); // validation toast
      return;
    }

    this.loading = true;
    this.toast.showInfo('Submitting your details...');

    this.contactService.submitContact(this.contactForm.value).subscribe({
      next: res => {
        this.toast.showSuccess('Thank you! Your details have been submitted.');
        this.contactForm.reset();
        this.loading = false;
        this.router.navigate(['/']); // Redirect to home page after successful submission
      },
      error: err => {
        const apiMessage = err?.error?.message || 'Failed to submit. Please try again.';
        this.toast.showError(apiMessage);
        this.loading = false;
      }
    });
  }
}
