import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username_value='SreeSaiWheelTech';
  password_value='BabaNagar@123'
  loginForm: FormGroup;
  showPassword = false;
  
  constructor(private fb: FormBuilder, private router:Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  
  isFieldInvalid(field: string): boolean {
    const formControl = this.loginForm.get(field);
    return formControl ? formControl.invalid && (formControl.dirty || formControl.touched) : false;
  }
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  onSubmit(): void {
    if (this.loginForm.valid) {
      const formValues = this.loginForm.value;
      if (formValues.username === this.username_value && formValues.password === this.password_value) {
        this.router.navigate(['/home']);
      } else {
        alert('Incorrect username or password');
      }
      console.log('Login form submitted', this.loginForm.value);
      // Here you would typically call your authentication service
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}