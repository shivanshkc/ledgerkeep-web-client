import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BudgetDTO, GetBudgetQueryDTO } from '../models';
import { BasicAuthService } from './basic-auth.service';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(
    private readonly _http: HttpClient,
    private readonly _auth: BasicAuthService,
    private readonly _conf: ConfigService,
  ) {}

  /**
   * Wrapper for GET /stats/budget API.
   * @returns Budget information.
   */
  public async getBudget(query: GetBudgetQueryDTO): Promise<BudgetDTO> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/stats/budget`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const params = query as Record<string, string>;
    const respObservable = this._http.get(endpoint, { params, headers: { Authorization: token } });
    const response = await firstValueFrom(respObservable);

    return (response as { data: BudgetDTO }).data;
  }

  /**
   * Wrapper for GET /stats/balances API.
   * @returns Total Balance variation information.
   */
  public async getBalances(): Promise<{ [key: number]: number }> {
    const conf = await this._conf.get();
    const endpoint = `${conf.backend.baseURL}/stats/balances`;
    const token = `Basic ${this._auth.getLoginData()}`;

    const respObservable = this._http.get(endpoint, { headers: { Authorization: token } });
    const response = await firstValueFrom(respObservable);

    return (response as { data: { [key: number]: number } }).data;
  }
}
