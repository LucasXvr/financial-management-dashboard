import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../login/login.component.scss'
})
export class ForgotPasswordComponent {
  protected loading = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected readonly form;

  constructor(
    formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    protected readonly theme: ThemeService
  ) {
    this.form = formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  protected submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.authService.forgotPassword(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.';
        this.changeDetectorRef.markForCheck();
      },
      error: (error: Error) => {
        this.loading = false;
        this.errorMessage = error.message;
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
