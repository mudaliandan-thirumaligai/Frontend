import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactService } from '../../../service/contact-us.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
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
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', Validators.email],
      whatsappNumber: ['', Validators.pattern(/^[6-9]\d{9}$/)],
      postalAddress: [''],
      query: ['']
    });
  }

  private showValidationError(): boolean {
    const controls = this.contactForm.controls;

    // Required: name
    if (!controls['name'].value?.trim()) {
      this.toast.showError('Please enter your name');
      return false;
    }

    // Required: type
    if (!controls['type'].value) {
      this.toast.showError('Please select a type');
      return false;
    }

    // Required: mobile — check empty first, then format
    if (!controls['mobile'].value?.trim()) {
      this.toast.showError('Please enter your mobile number');
      return false;
    }
    if (controls['mobile'].invalid) {
      this.toast.showError('Please enter a valid 10-digit mobile number (starts with 6–9)');
      return false;
    }

    // Optional: email — only validate format if filled
    if (controls['email'].value?.trim() && controls['email'].invalid) {
      this.toast.showError('Please enter a valid email address');
      return false;
    }

    // Optional: whatsapp — only validate format if filled
    if (controls['whatsappNumber'].value?.trim() && controls['whatsappNumber'].invalid) {
      this.toast.showError('Please enter a valid 10-digit WhatsApp number (starts with 6–9)');
      return false;
    }

    return true;
  }

  submitForm() {
    if (!this.showValidationError()) {
      return;
    }

    this.loading = true;
    this.toast.showInfo('Submitting your details...');

    // ✅ Clean the payload — remove empty optional fields
    const rawValue = this.contactForm.value;
    const payload = {
      ...rawValue,
      email: rawValue.email?.trim() || undefined,
      whatsappNumber: rawValue.whatsappNumber?.trim() || undefined,
      postalAddress: rawValue.postalAddress?.trim() || undefined,
      query: rawValue.query?.trim() || undefined,
    };
    console.log('Payload being sent:', payload);
    this.contactService.submitContact(payload).subscribe({
      next: () => {
        this.toast.showSuccess('Thank you! Your details have been submitted successfully.');
        this.contactForm.reset();
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: err => {
        const apiMessage = err?.error?.message || 'Failed to submit. Please try again.';
        this.toast.showError(apiMessage);
        this.loading = false;
      }
    });
  }
}