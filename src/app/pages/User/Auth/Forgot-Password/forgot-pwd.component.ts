import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/Auth/auth.service';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    LabelComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './forgot-pwd.component.html',
  styles: ``
})
export class ForgotPasswordComponent {

  username: string = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  onForgotPassword() {
    if (!this.username) {
      this.toast.showError('Username is required');
      return;
    }

    this.isLoading = true;
    this.toast.showInfo('Sending reset instructions...');

    this.authService.forgotPassword(this.username)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (res) => {
          this.toast.showSuccess(res?.message || 'Password reset email sent successfully!');
          this.username = '';

          // Redirect user back to sign-in or home
          this.router.navigate(['/signin']);
        },
        error: (err) => {
          const apiMessage = err?.error?.message;
          const details = err?.error?.details;

          const message = apiMessage 
            ? (details ? `${apiMessage}: ${details}` : apiMessage)
            : 'Failed to send password reset email';

          this.toast.showError(message);
        }
      });
  }
}
