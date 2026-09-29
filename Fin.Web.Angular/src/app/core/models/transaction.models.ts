import { Category, PagedResponse } from './category.models';

export enum TransactionType {
  Deposit = 1,
  Withdraw = 2,
  Saving = 3
}

export interface Transaction {
  id: number;
  title: string;
  createdAt: string;
  paidOrReceivedAt: string | null;
  type: TransactionType;
  amount: number;
  categoryId: number;
  category?: Category | null;
  isSavings: boolean;
}

export interface CreateTransactionRequest {
  title: string;
  type: TransactionType;
  amount: number;
  categoryId: number;
  paidOrReceivedAt: string;
}

export type UpdateTransactionRequest = CreateTransactionRequest;

export type TransactionPagedResponse = PagedResponse<Transaction[]>;
