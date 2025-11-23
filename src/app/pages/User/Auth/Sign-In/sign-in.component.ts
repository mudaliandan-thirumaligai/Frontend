import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { SigninFormComponent } from '../../../../shared/components/auth/signin-form/signin-form.component';
import { AuthService } from '../../../../shared/services/Auth/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [
    AuthPageLayoutComponent,
    SigninFormComponent,
  ],
  templateUrl: './sign-in.component.html',
  styles: ``
})
export class UserSignInComponent {

  constructor(private authService: AuthService) {}

  onFormSubmitted(data: { username: string; password: string }) {
    console.log("RECEIVED IN PARENT:", data);

    // Call auth service login
    this.authService.login(data.username, data.password).subscribe({
      next: (res) => {
        console.log("Login success:", res);
        // JWT + username + role already stored inside AuthService
      },
      error: (err) => {
        console.error("Login failed:", err);
      }
    });
  }
}
