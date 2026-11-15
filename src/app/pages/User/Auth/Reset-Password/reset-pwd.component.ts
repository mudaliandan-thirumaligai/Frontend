import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../shared/services/Auth/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-pwd.component.html',
  standalone: true,
  imports: [
    ButtonComponent,
    InputFieldComponent,
    LabelComponent
  ],
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';

  newPassword = '';
  confirmPassword = '';

  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';

    if (!this.token) {
      this.toast.showError("Invalid or missing reset token.");
      this.router.navigate(['/']);
      return;
    }
  }

  togglePasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onResetPassword() {

    if (!this.newPassword || !this.confirmPassword) {
      this.toast.showError("All fields are required.");
      return;
    }

    if (this.newPassword.length < 6) {
      this.toast.showError("Password must be at least 6 characters.");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toast.showError("Passwords do not match.");
      return;
    }

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.toast.showSuccess("Password reset successfully!");
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        const message = err?.error?.message || "Reset failed. Please try again.";
        this.toast.showError(message);
      }
    });

  }
}
