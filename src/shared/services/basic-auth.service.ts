import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscriber, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BasicAuthService {
  private readonly _tokenKey = 'basic_auth_token';

  private readonly _loginObservable: Observable<void>;
  private _loginSubscriber?: Subscriber<void>;

  private readonly _logoutObservable: Observable<void>;
  private _logoutSubscriber?: Subscriber<void>;

  constructor(private readonly _router: Router) {
    this._loginObservable = new Observable<void>((subscriber) => {
      this._loginSubscriber = subscriber;
    });

    this._logoutObservable = new Observable<void>((subscriber) => {
      this._logoutSubscriber = subscriber;
    });
  }

  /**
   * Creates a new login with the provided details.
   * @param user - Username for login.
   * @param pass - Password for login.
   */
  public login(user: string, pass: string): void {
    const token = window.btoa(`${user}:${pass}`);
    sessionStorage.setItem(this._tokenKey, token);
    this._loginSubscriber?.next();
  }

  /**
   * Deletes the login data and redirects user to the landing page.
   */
  public logout(): void {
    sessionStorage.removeItem(this._tokenKey); // Removing the login material.
    this._logoutSubscriber?.next(); // Emitting the logout event.
    this._router.navigate(['/landing']).then(() => {}); // Taking the user back to landing.
  }

  /**
   * This method can be used to listen to log in events.
   * @param next - Callback.
   */
  public onLogin(next: () => void): Subscription {
    return this._loginObservable.subscribe(next);
  }

  /**
   * This method can be used to listen to log out events.
   * @param next - Callback.
   */
  public onLogout(next: () => void): Subscription {
    return this._logoutObservable.subscribe(next);
  }

  /**
   * Provides the current login token string.
   * @returns Token string.
   */
  public getLoginData(): string | null {
    return sessionStorage.getItem(this._tokenKey);
  }

  /**
   * Checks whether the user is logged in or not.
   * @returns True is logged in, false otherwise.
   */
  public isLoggedIn(): boolean {
    return !!this.getLoginData();
  }
}
