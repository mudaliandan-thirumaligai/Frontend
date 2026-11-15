import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {

  @Output() formSubmit = new EventEmitter<{ username: string; password: string }>();

  showPassword = false;
  username = '';
  password = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignIn() {
    this.formSubmit.emit({
      username: this.username,
      password: this.password,
    });
  }
}
