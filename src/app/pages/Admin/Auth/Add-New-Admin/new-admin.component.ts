import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { CheckboxComponent } from '../../../../shared/components/form/input/checkbox.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterPayload } from '../../Auth/services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    CommonModule,
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './new-admin.component.html',
  styles: ``
})
export class AddNewAdmin {

  showPassword = false;
  isChecked = false;
  isLoading = false;

  username = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    if (!this.username || !this.email || !this.password) {
      this.toast.showError('Please fill in all required fields!');
      return;
    }
    // Check if user agreed to terms
    if (!this.isChecked) {
      this.toast.showError('You must agree to the terms and conditions!');
      return;
    }

    const payload: RegisterPayload = {
      username: this.username,
      password: this.password,
      email: this.email
    };

    this.isLoading = true;
    this.toast.showInfo('Registering user...');

    this.authService.register(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.toast.showSuccess(`User "${this.username}" registered successfully!`);
          this.username = '';
          this.email = '';
          this.password = '';
          this.isChecked = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          const apiMessage = err?.error?.message;
          const apiDetails = err?.error?.details;

          const toastMessage = apiMessage
            ? apiDetails
              ? `${apiMessage}: ${apiDetails}`
              : apiMessage
            : 'Failed to register user';

          this.toast.showError(toastMessage);
          console.error('Registration error:', err);
        }
      });
  }
}
