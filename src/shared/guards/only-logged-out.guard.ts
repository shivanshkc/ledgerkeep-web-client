import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { BasicAuthService } from '../services/basic-auth.service';

@Injectable({
  providedIn: 'root',
})
/** Keeps the logged-in users away from pages like login, signup etc. */
export class OnlyLoggedOutGuard implements CanActivate {
  constructor(private readonly _router: Router, private readonly _auth: BasicAuthService) {}

  public canActivate(): boolean {
    const isLoggedIn = this._auth.isLoggedIn();
    if (isLoggedIn) this._router.navigate(['/transactions']).then(() => {});

    return !isLoggedIn;
  }
}
