import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, ChangePasswordPayload } from '../../../../shared/services/Auth/auth.service';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    LabelComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './reset-pwd.component.html',
  styles: ``
})
export class ResetPasswordComponent {

  showPassword = false;

  oldPassword: string = '';
  newPassword: string = '';

  isLoading = false;

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onChangePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.toast.showError('All fields are required');
      return;
    }

    const payload = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.isLoading = true;
    this.toast.showInfo('Processing your request...');

    this.authService.changePassword(payload)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.toast.showSuccess(res?.message || 'Password changed successfully!');

          // Clear fields
          this.oldPassword = '';
          this.newPassword = '';

          // Redirect to login or dashboard
          this.router.navigate(['/']);
        },
        error: (err) => {
          const apiMessage = err?.error?.message;
          const apiDetails = err?.error?.details;

          const toastMessage =
            apiMessage ? (apiDetails ? `${apiMessage}: ${apiDetails}` : apiMessage)
                      : 'Failed to change password';

          this.toast.showError(toastMessage);
        }
      });
  }

}
