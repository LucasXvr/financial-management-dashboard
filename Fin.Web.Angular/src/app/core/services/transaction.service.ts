import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth-api.models';
import {
  CreateTransactionRequest,
  Transaction,
  TransactionPagedResponse,
  UpdateTransactionRequest
} from '../models/transaction.models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly transactionsUrl = `${environment.apiBaseUrl}/v1/transactions`;

  constructor(private readonly http: HttpClient) {}

  getTransactions(
    pageNumber: number,
    pageSize: number
  ): Observable<TransactionPagedResponse> {
    return this.http.get<TransactionPagedResponse>(this.transactionsUrl, {
      params: {
        startDate: '2000-01-01',
        endDate: '2100-12-31',
        pageNumber,
        pageSize
      }
    });
  }

  createTransaction(payload: CreateTransactionRequest): Observable<Transaction> {
    return this.http
      .post<ApiResponse<Transaction>>(this.transactionsUrl, payload)
      .pipe(map((response) => this.requireTransaction(response)));
  }

  updateTransaction(
    id: number,
    payload: UpdateTransactionRequest
  ): Observable<Transaction> {
    return this.http
      .put<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}`, payload)
      .pipe(map((response) => this.requireTransaction(response)));
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<Transaction>>(`${this.transactionsUrl}/${id}`)
      .pipe(map(() => void 0));
  }

  private requireTransaction(response: ApiResponse<Transaction>): Transaction {
    if (!response.data) {
      throw new Error('A API não retornou a transação.');
    }

    return response.data;
  }
}
