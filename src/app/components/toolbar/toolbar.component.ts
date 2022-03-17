import { Component, Input, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

import { ConfirmationDialogService } from '../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { BasicAuthService } from '../../../shared/services/basic-auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  @Input() public mainDrawer?: MatDrawer;
  @Input() public title = 'Example';

  constructor(public readonly auth: BasicAuthService, private _confirm: ConfirmationDialogService) {}

  ngOnInit(): void {}

  /** OnClick handler for the logout button. */
  public async onLogoutClick(): Promise<void> {
    const shouldLogout = await this._confirm.prompt({
      width: '350px',
      title: 'Logout',
      body: 'You will be returned to the login screen.',
      confirmButtonText: 'Confirm',
      confirmButtonColor: 'primary',
      cancelButtonText: 'Cancel',
      cancelButtonColor: undefined,
    });

    if (shouldLogout) this.auth.logout();
  }
}
