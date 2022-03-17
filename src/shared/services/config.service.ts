import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as deepmerge from 'deepmerge';
import { firstValueFrom } from 'rxjs';

import { ConfigDTO } from '../models';
import { sleep, tc } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  // This is the configs file location.
  private readonly CONFIG_URL = 'assets/conf.json';

  // When all goes down, these configs will be used.
  private readonly _defaultConfigs: ConfigDTO = {
    backend: { baseURL: 'http://localhost:8080/api' },
    cache: { enabled: true, ttlSeconds: 600 },
  };

  // These are the loaded configs. Initially they are kept the same as the default configs.
  private _configs: ConfigDTO = this._defaultConfigs;
  // A flag to check if the configs have been loaded.
  private _isLoaded = false;

  constructor(private readonly _http: HttpClient) {}

  /** Get fetches the configs. It only loads configs once with an HTTP call. */
  public async get(): Promise<ConfigDTO> {
    // If configs have already been loaded, we return them.
    if (this._isLoaded) return this._configs;

    // Without this sleep, the HTTP call is sent way too early, before the configs object is even available.
    // That leads to the default configs always being loaded initially.
    await sleep(0);

    // Loading the configs for the first and final time.
    const httpPromise = firstValueFrom(this._http.get<ConfigDTO>(this.CONFIG_URL));
    const [err, configs] = await tc(httpPromise);
    if (err || !configs) {
      console.error('Failed to load configs:', err?.message || 'unknown');
      this._configs = this._defaultConfigs;
    }
    // Deep merging the loaded and default config to fill out any missing fields.
    else this._configs = deepmerge<ConfigDTO>(this._defaultConfigs, configs);

    console.info('Using configs:', this._configs);
    // Marking the configs as loaded and returning them.
    this._isLoaded = true;
    return this._configs;
  }
}
