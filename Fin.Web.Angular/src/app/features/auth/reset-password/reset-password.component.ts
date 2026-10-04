import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: '../register/register.component.scss'
})
export class ResetPasswordComponent {
  protected loading = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected showPassword = false;
  protected showConfirmPassword = false;
  protected readonly email: string;
  protected readonly token: string;
  protected readonly form;

  constructor(
    formBuilder: FormBuilder,
    route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    protected readonly theme: ThemeService
  ) {
    this.email = route.snapshot.queryParamMap.get('email') ?? '';
    this.token = route.snapshot.queryParamMap.get('token') ?? '';
    this.form = formBuilder.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });

    if (!this.email || !this.token)
      this.errorMessage = 'O link de recuperação está incompleto ou inválido.';
  }

  protected submit(): void {
    if (this.form.invalid || this.loading || !this.email || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    if (values.password !== values.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    if (!passwordIsStrong(values.password)) {
      this.errorMessage = 'A senha deve conter 8 caracteres, com letra maiúscula, minúscula, número e símbolo.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.authService.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: values.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Senha redefinida com sucesso. Você já pode entrar.';
        this.form.disable();
        this.changeDetectorRef.markForCheck();
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}

function passwordIsStrong(password: string): boolean {
  return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password)
    && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}
