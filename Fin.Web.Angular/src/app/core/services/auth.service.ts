import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface LoginData {
  token?: string;
  accessToken?: string;
}

interface LoginApiResponse {
  token?: string;
  accessToken?: string;
  data?: LoginData;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly loginUrl = `${environment.apiBaseUrl}/v1/identity/login`;
  private readonly registerUrl = `${environment.apiBaseUrl}/v1/identity/register`;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) {}

  login(payload: LoginRequest): Observable<void> {
    return this.http.post<LoginApiResponse>(this.loginUrl, payload).pipe(
      map((response) => {
        const token =
          response.token ??
          response.accessToken ??
          response.data?.token ??
          response.data?.accessToken;

        if (!token) {
          throw new Error('Token JWT nao encontrado na resposta da API.');
        }

        return token;
      }),
      tap((token) => this.tokenService.setToken(token)),
      map(() => void 0)
    );
  }

  register(payload: RegisterRequest): Observable<void> {
    return this.http.post(this.registerUrl, payload).pipe(
      switchMap(() => this.login(payload))
    );
  }

  logout(): void {
    this.tokenService.clearToken();
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }
}
