import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, lastValueFrom, Observable, of, tap } from 'rxjs';

import { ConfigService } from '../services/config.service';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  private static _cacheHTTP = new Map<string, HttpResponse<unknown>>();

  constructor(private readonly _conf: ConfigService) {
    this._setCacheClearInterval().then(() => {});
  }

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this._interceptAsync(request, next));
  }

  /** _interceptAsync is just an async version of the intercept method. */
  public async _interceptAsync(request: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
    // Cache is clear before executing any write request.
    if (this._isWriteRequest(request)) CachingInterceptor._cacheHTTP.clear();
    // If request is not cacheable, it is right away processed.
    if (!this._isRequestCacheable(request)) return lastValueFrom(next.handle(request));

    const conf = await this._conf.get();
    // If caching is not enabled, request is right away processed.
    if (!conf.cache.enabled) return lastValueFrom(next.handle(request));

    const requestKey = this._requestToKey(request);
    // If request is cacheable, we check if there's already a cached response for it.
    const cachedResponse = CachingInterceptor._cacheHTTP.get(requestKey);
    if (cachedResponse) return lastValueFrom(of(cachedResponse.clone()));

    // This is the callback function for the tap operator below.
    // It checks if the HttpEvent is an HttpResponse. If yes, it caches it.
    const tapper = (event: HttpEvent<unknown>): void => {
      if (event instanceof HttpResponse) CachingInterceptor._cacheHTTP.set(requestKey, event.clone());
    };

    // Processing the request.
    const httpObservable = next.handle(request).pipe(tap(tapper));
    return lastValueFrom(httpObservable);
  }

  /** Clears the cache at the configured TTL intervals. */
  private async _setCacheClearInterval(): Promise<void> {
    const conf = await this._conf.get();
    // If caching is not enabled, we do nothing.
    if (!conf.cache.enabled) return;

    // This interval will keep clearing the cache at specified TTL intervals.
    setInterval(() => {
      console.info('Clearing cache...');
      CachingInterceptor._cacheHTTP.clear();
    }, conf.cache.ttlSeconds * 1000);
  }

  /** Returns true if the request intends to do a write operation. */
  private _isWriteRequest(request: HttpRequest<unknown>): boolean {
    return request.method !== 'GET';
  }

  /**
   * Judges if the provided HTTP request should be cached or not.
   * @param request - HTTP request to be judged.
   * @private
   */
  private _isRequestCacheable(request: HttpRequest<unknown>): boolean {
    // Only GET requests are cached.
    if (this._isWriteRequest(request)) return false;
    // Only backend requests are cached.
    if (!request.url.includes('/api/')) return false;

    return true;
  }

  /**
   * Converts an HTTP request to a string that can be used as a map key.
   * @param request - Request to be converted to string.
   * @private
   */
  private _requestToKey(request: HttpRequest<unknown>): string {
    const headers: { [key: string]: unknown } = {};
    // Converting the HttpHeaders object to an object literal for stringification.
    request.headers.keys().forEach((key) => {
      headers[key] = request.headers.getAll(key);
    });

    // The request key is the combination of headers, route and query params.
    // This way all different GET request generate a unique string.
    return `${JSON.stringify(headers)}::${request.urlWithParams}`;
  }
}
