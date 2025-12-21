import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CheckboxComponent } from '../../../../shared/components/form/input/checkbox.component';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, RegisterPayload } from '../../../../shared/services/Auth/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxComponent,
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
        next: () => {
          this.toast.showSuccess(`User "${this.username}" registered successfully!`);

          // Reset form
          this.username = '';
          this.email = '';
          this.password = '';
          this.isChecked = false;

          // Redirect to login page or home
          this.router.navigate(['/']);
        },
        error: (err) => {
          const message = err?.error?.message ?? 'Failed to register user';
          const details = err?.error?.details;

          this.toast.showError(details ? `${message}: ${details}` : message);
          console.error('Registration error:', err);
        }
      });
  }
}
