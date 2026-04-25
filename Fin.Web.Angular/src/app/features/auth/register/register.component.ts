import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  protected loading = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected readonly registerForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    this.registerForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  protected submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formValue = this.registerForm.getRawValue();

    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage = 'As senhas nao coincidem.';
      return;
    }

    const hasDigit = /\d/.test(formValue.password);
    const hasLowercase = /[a-z]/.test(formValue.password);
    const hasUppercase = /[A-Z]/.test(formValue.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formValue.password);
    const hasMinLength = formValue.password.length >= 8;

    if (!hasDigit || !hasLowercase || !hasUppercase || !hasSpecialChar || !hasMinLength) {
      this.errorMessage =
        'A senha deve conter 8 caracteres, com letra maiuscula, minuscula, numero e simbolo.';
      return;
    }

    this.loading = true;
    this.authService
      .register({ email: formValue.email, password: formValue.password })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Conta criada com sucesso. Redirecionando...';
          setTimeout(() => {
            void this.router.navigate(['/app/dashboard']);
          }, 1200);
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Nao foi possivel criar a conta. Tente novamente.';
        }
      });
  }
}
