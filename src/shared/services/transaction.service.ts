import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ListTransactionsQueryDTO, TransactionDTO } from '../models';
import { BasicAuthService } from './basic-auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(
    private readonly _http: HttpClient,
    private readonly _auth: BasicAuthService,
    private readonly _conf: ConfigService,
  ) {}

  /**
   * Wrapper for POST /transactions API.
   * @param transaction - Transaction to be created.
   */
  public async createTransaction(transaction: TransactionDTO): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/transactions`;
    const token = `Basic ${this._auth.getLoginData()}`;

    await firstValueFrom(this._http.post(endpoint, transaction, { headers: { Authorization: token } }));
  }

  /**
   * Wrapper for GET /transactions API.
   * @returns List of transactions.
   */
  public async listTransactions(query: ListTransactionsQueryDTO): Promise<{ list: TransactionDTO[]; count: number }> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/transactions`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const params = query as Record<string, string>;
    const httpResp = this._http.get(endpoint, { observe: 'response', params, headers: { Authorization: token } });
    const { headers, body } = await firstValueFrom(httpResp);

    const transactions = (body as { data: TransactionDTO[] }).data || [];
    const countStr = headers.get('x-total-count');
    const count = countStr ? parseInt(countStr, 10) : 0;

    return { list: transactions, count };
  }

  /**
   * Wrapper for PATCH /transactions/:id API.
   * @param transaction
   */
  public async updateTransaction(transaction: TransactionDTO): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/transactions/${transaction.id}`;
    const token = `Basic ${this._auth.getLoginData()}`;

    await firstValueFrom(this._http.patch(endpoint, transaction, { headers: { Authorization: token } }));
  }

  /**
   * Wrapper for DELETE /transactions/:id API.
   * @param id
   */
  public async deleteTransaction(id: string): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/transactions/${id}`;
    const token = `Basic ${this._auth.getLoginData()}`;

    await firstValueFrom(this._http.delete(endpoint, { headers: { Authorization: token } }));
  }
}
