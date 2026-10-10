import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { FinancialAccountSummary } from '../models/financial-account.models';

@Injectable({ providedIn: 'root' })
export class FinancialAccountService {
  private readonly accountUrl = `${environment.apiBaseUrl}/v1/accounts/default`;

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<FinancialAccountSummary> {
    return this.http.get<FinancialAccountSummary>(this.accountUrl);
  }

  reconcile(currentBalance: number): Observable<FinancialAccountSummary> {
    return this.http.put<FinancialAccountSummary>(`${this.accountUrl}/balance`, {
      currentBalance
    });
  }
}
