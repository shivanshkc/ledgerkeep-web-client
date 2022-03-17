import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AccountDTO } from '../models';
import { BasicAuthService } from './basic-auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(
    private readonly _http: HttpClient,
    private readonly _auth: BasicAuthService,
    private readonly _conf: ConfigService,
  ) {}

  /**
   * Wrapper for the base API (GET baseURL)
   * This is being used to test if the login credentials are correct or not.
   */
  public async base(username: string, password: string): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = conf.backend.baseURL;

    const base64 = window.btoa(`${username}:${password}`);
    const token = `Basic ${base64}`;

    await firstValueFrom(this._http.get(endpoint, { headers: { Authorization: token } }));
  }

  /**
   * Wrapper for POST /accounts API.
   */
  public async createAccount(accountID: string, accountName: string): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/accounts`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const body = { id: accountID, name: accountName };
    await firstValueFrom(this._http.post(endpoint, body, { headers: { Authorization: token } }));
  }

  /**
   * Wrapper for GET /accounts API.
   * @returns List of accounts.
   */
  public async listAccounts(): Promise<AccountDTO[]> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/accounts`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const response = await firstValueFrom(this._http.get(endpoint, { headers: { Authorization: token } }));
    return (response as { data: AccountDTO[] }).data || [];
  }

  /**
   * Wrapper for PATCH /accounts/:accountID API.
   */
  public async updateAccount(accountID: string, accountName: string): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/accounts/${accountID}`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const body = { name: accountName };
    await firstValueFrom(this._http.patch(endpoint, body, { headers: { Authorization: token } }));
  }

  /**
   * Wrapper for DELETE /accounts/:accountID API.
   */
  public async deleteAccount(accountID: string): Promise<void> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/accounts/${accountID}`;
    const token = `Basic ${this._auth.getLoginData()}`;

    await firstValueFrom(this._http.delete(endpoint, { headers: { Authorization: token } }));
  }
}
