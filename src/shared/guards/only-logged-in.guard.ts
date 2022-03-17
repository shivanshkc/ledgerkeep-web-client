import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

import { BasicAuthService } from '../services/basic-auth.service';

@Injectable({
  providedIn: 'root',
})
/** Protects the routes that should only be accessed by logged-in users. */
export class OnlyLoggedInGuard implements CanActivate {
  constructor(private readonly _auth: BasicAuthService) {}

  public canActivate(): boolean {
    const isLoggedIn = this._auth.isLoggedIn();
    if (!isLoggedIn) this._auth.logout();

    return isLoggedIn;
  }
}
