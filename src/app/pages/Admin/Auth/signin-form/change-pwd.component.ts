import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LabelComponent } from '../../../../shared/components/form/label/label.component';
import { ButtonComponent } from '../../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../../shared/components/form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    LabelComponent,
   // CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './change-pwd.component.html',
  styles: ``
})
export class ChangePasswordComponent {

  showPassword = false;
  // isChecked = false;

  username = '';
  password = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // TODO need to add api calling here 

  onSignIn() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
    // console.log('Remember Me:', this.isChecked);
  }
}
