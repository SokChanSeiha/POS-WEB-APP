import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginHelpText: string = "Incorrect password or email.";
  showAlert: boolean = false;
  email: string = '';
  password: string = '';

  onSubmit() {
    const isValid = this.validateCredentials(this.email, this.password);
    
    if (!isValid) {
      this.loginHelpText = "Incorrect password or email.";
      this.showAlert = true;
    } else {
      this.loginHelpText = "Login successful";
      this.showAlert = true; // Show the success message
    }
  }

  private validateCredentials(email: string, password: string): boolean {
    return email === 'abc' && password === '123';
  }
}