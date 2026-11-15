import { Component } from '@angular/core';
import { SigninFormComponent } from '../../../../shared/components/auth/signin-form/signin-form.component';
import { AuthService } from '../../../../shared/services/Auth/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  imports: [
    SigninFormComponent,
  ],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class UserSignInComponent {

  constructor(private authService: AuthService, private toast : ToastService) {}

  isLoading = false;

  onFormSubmitted(data: { username: string; password: string }) {
    if (!data.username || !data.password) {
      this.toast.showError('Please enter both username and password');
      return;
    }

    this.isLoading = true;
    this.toast.showInfo('Logging in...');

    this.authService.login(data.username, data.password)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => this.toast.showSuccess('Logged in successfully!'),
        error: (err) => {
          const apiMessage = err?.error?.message;
          const apiDetails = err?.error?.details;
          const toastMessage = apiMessage ? (apiDetails ? `${apiMessage}: ${apiDetails}` : apiMessage)
                                          : 'Login failed. Please try again.';
          this.toast.showError(toastMessage);
        }
      });
  }

}
