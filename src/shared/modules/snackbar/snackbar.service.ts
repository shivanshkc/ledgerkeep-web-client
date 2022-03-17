import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

import { SnackbarDTO } from '../../models';
import { SnackbarComponent } from './snackbar.component';
import { SnackbarModule } from './snackbar.module';

@Injectable({
  providedIn: SnackbarModule,
})
export class SnackbarService {
  private readonly _snackBarDurationMS = 2500;

  constructor(private readonly _snackBar: MatSnackBar) {}

  public debug(snack: boolean, message?: unknown): void {
    if (snack) {
      this._openSnackBar({ message: `${message}`, color: 'primary', icon: 'description' });
    }
    console.debug(message);
  }

  public success(snack: boolean, message?: unknown): void {
    if (snack) {
      this._openSnackBar({ message: `${message}`, color: 'primary', icon: 'check' });
    }
    console.info(message);
  }

  public info(snack: boolean, message?: unknown): void {
    if (snack) {
      this._openSnackBar({ message: `${message}`, color: 'primary', icon: 'info' });
    }
    console.info(message);
  }

  public warn(snack: boolean, message?: unknown): void {
    if (snack) {
      this._openSnackBar({ message: `${message}`, color: 'warn', icon: 'warning' });
    }
    console.warn(message);
  }

  public error(snack: boolean, message?: unknown): void {
    if (snack) {
      this._openSnackBar({ message: `${message}`, color: 'warn', icon: 'error' });
    }
    console.error(message);
  }

  /**
   * @description _openSnackBar opens the snackbar.
   * @private
   */
  private _openSnackBar(data: SnackbarDTO): void {
    const config: MatSnackBarConfig = { data, duration: this._snackBarDurationMS, horizontalPosition: 'left' };
    this._snackBar.openFromComponent(SnackbarComponent, config);
  }
}
