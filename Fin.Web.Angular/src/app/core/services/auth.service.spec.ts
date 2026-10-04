import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService password recovery', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: {} }
      ]
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('requests a password recovery email', () => {
    let completed = false;
    service.forgotPassword({ email: 'usuario@example.com' }).subscribe(() => completed = true);

    const request = httpTesting.expectOne('/v1/identity/forgot-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ email: 'usuario@example.com' });
    request.flush({ message: 'Instruções enviadas' });

    expect(completed).toBe(true);
  });

  it('submits the token and new password', () => {
    let completed = false;
    service.resetPassword({
      email: 'usuario@example.com',
      token: 'reset-token',
      newPassword: 'NewPass@456'
    }).subscribe(() => completed = true);

    const request = httpTesting.expectOne('/v1/identity/reset-password');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'usuario@example.com',
      token: 'reset-token',
      newPassword: 'NewPass@456'
    });
    request.flush({ message: 'Senha redefinida' });

    expect(completed).toBe(true);
  });
});
