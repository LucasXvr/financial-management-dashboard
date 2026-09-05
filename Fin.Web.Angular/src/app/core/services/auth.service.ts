import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';

import {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  extractApiMessage,
  extractToken
} from '../models/auth-api.models';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = `${environment.apiBaseUrl}/v1/identity/login`;
  private readonly registerUrl = `${environment.apiBaseUrl}/v1/identity/register`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) {}

  login(payload: LoginRequest): Observable<void> {
    return this.http.post<ApiResponse<unknown>>(this.loginUrl, payload).pipe(
      map((response) => this.persistTokenFromResponse(response)),
      map(() => void 0),
      catchError((error) => this.toAuthError(error, 'Nao foi possivel autenticar. Verifique suas credenciais.'))
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http
      .post<ApiResponse<string>>(this.registerUrl, payload)
      .pipe(
        switchMap(() => this.login(payload)),
        catchError((error) => this.toAuthError(error, 'Nao foi possivel criar a conta. Tente novamente.'))
      );
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  private persistTokenFromResponse(response: unknown): string {
    const token = extractToken(response);

    if (!token) {
      throw new Error('Token JWT nao encontrado na resposta da API.');
    }

    this.tokenService.setToken(token);
    return token;
  }

  private toAuthError(error: unknown, fallbackMessage: string): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const message = extractApiMessage(error.error, fallbackMessage);
      return throwError(() => new Error(message));
    }

    if (error instanceof Error) {
      return throwError(() => error);
    }

    return throwError(() => new Error(fallbackMessage));
  }
}
