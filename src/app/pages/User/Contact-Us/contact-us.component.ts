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
      mobile: ['', Validators.required],   
      email: ['', Validators.email],        
      whatsappNumber: [''],
      postalAddress: [''],
      query: ['']
    });
  }
  private showValidationError(): boolean {
    const controls = this.contactForm.controls;

    if (controls['name'].invalid) {
      this.toast.showError('Please enter your name');
      return false;
    }

    if (controls['type'].invalid) {
      this.toast.showError('Please select a type');
      return false;
    }

    if (controls['mobile'].invalid) {
      this.toast.showError('Please enter your mobile number');
      return false;
    }

    // Optional: validate email format only if entered
    if (
      controls['email'].value &&
      controls['email'].invalid
    ) {
      this.toast.showError('Please enter a valid email address');
      return false;
    }

    return true; // ✅ all good
  }


  submitForm() {
    if (!this.showValidationError()) {
      return; 
    }
    console.log("Submitting...");

    this.loading = true;
    this.toast.showInfo('Submitting your details...');

    this.contactService.submitContact(this.contactForm.value).subscribe({
      next: () => {
        this.toast.showSuccess(
          'Thank you! Your details have been submitted successfully.'
        );
        this.contactForm.reset();
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: err => {
        const apiMessage =
          err?.error?.message || 'Failed to submit. Please try again.';
        this.toast.showError(apiMessage);
        this.loading = false;
      }
    });
  }

}
