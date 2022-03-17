import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';

import { smallScreenBreakpoint } from '../shared/constants';
import { DrawerListItem } from '../shared/models';
import { BasicAuthService } from '../shared/services/basic-auth.service';
import { ScreenResizeService } from '../shared/services/screen-resize.service';
import { sleep } from '../shared/utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mainDrawer') mainDrawer?: MatDrawer;

  public readonly title = 'Ledgerkeep';
  public readonly drawerList: DrawerListItem[] = [
    { icon: 'account_balance', name: 'Accounts', link: '/accounts' },
    { icon: 'receipt_long', name: 'Transactions', link: '/transactions' },
    { icon: 'functions', name: 'Statistics', link: '/statistics' },
  ];

  private _loginSubscription?: Subscription;
  private _logoutSubscription?: Subscription;

  constructor(private readonly _resize: ScreenResizeService, private readonly _auth: BasicAuthService) {}

  public async ngAfterViewInit(): Promise<void> {
    // sleep is used to avoid ExpressionChangedAfterItHasBeenCheckedError error.
    await sleep(0);
    // The mainDrawer is open by default only if the user is logged in and the screen is large.
    this._auth.isLoggedIn() && !this.isSmallScreen() ? this.mainDrawer?.open() : this.mainDrawer?.close();

    // The drawer is opened on login, if the screen is large.
    this._loginSubscription = this._auth.onLogin(() => {
      if (this.isSmallScreen()) return;
      this.mainDrawer?.open();
    });

    // The drawer is closed on logout.
    this._logoutSubscription = this._auth.onLogout(() => {
      this.mainDrawer?.close();
    });
  }

  public ngOnDestroy(): void {
    this._loginSubscription?.unsubscribe();
    this._logoutSubscription?.unsubscribe();
  }

  /** isSmallScreen returns true if the current screen is a small screen. */
  public isSmallScreen(): boolean {
    return this._resize.currentWidth < smallScreenBreakpoint;
  }

  /** OnClick action for anywhere on the drawer. */
  public onDrawerClick(): void {
    if (!this.isSmallScreen()) return;
    // On small screens, the mainDrawer is automatically closed upon a click.
    this.mainDrawer?.close();
  }
}
