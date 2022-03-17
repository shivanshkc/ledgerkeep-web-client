import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, from, lastValueFrom, Observable, ObservableInput, of, throwError } from 'rxjs';

import { backendCustomCodes, backendCustomCodeToErrorMap, displayableErrors } from '../constants';
import { BasicAuthService } from '../services/basic-auth.service';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
  constructor(private readonly _auth: BasicAuthService) {}

  public intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this._interceptAsync(request, next));
  }

  /** _interceptAsync is just an async version of the intercept method. */
  public async _interceptAsync(request: HttpRequest<unknown>, next: HttpHandler): Promise<HttpEvent<unknown>> {
    const handler = this._handleHTTPError.bind(this);

    const httpObservable = next.handle(request).pipe(catchError(handler));
    return lastValueFrom(httpObservable);
  }

  /**
   * Handles all backend HTTP errors.
   * @param event - The HTTP Error.
   */
  private _handleHTTPError(event: HttpEvent<unknown>): ObservableInput<HttpEvent<unknown>> {
    // If the event is not an HTTP error response, we do nothing.
    if (!(event instanceof HttpErrorResponse)) {
      return of(event);
    }

    // Casting the event into HttpErrorResponse to access the custom code.
    const err = event as HttpErrorResponse;

    // Extracting the custom code.
    const customCode = err?.error?.custom_code;
    if (!customCode) {
      console.warn('No custom code present in backend response:', err.message);
      return throwError(() => displayableErrors.Default);
    }

    // If we don't recognize the custom code, default error is returned.
    if (!backendCustomCodeToErrorMap.has(customCode)) {
      console.warn('Unexpected custom code in backend response:', customCode);
      return throwError(() => displayableErrors.Default);
    }

    // If the response is 401, we log out.
    if (customCode === backendCustomCodes.unauthorized) {
      this._auth.logout();
    }

    // Converting the customCode to corresponding message.
    return throwError(() => backendCustomCodeToErrorMap.get(customCode));
  }
}
