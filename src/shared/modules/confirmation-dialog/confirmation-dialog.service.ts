import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationDialogDTO, ConfirmationDialogInternalDTO } from '../../models';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogModule } from './confirmation-dialog.module';

@Injectable({
  providedIn: ConfirmationDialogModule,
})
export class ConfirmationDialogService {
  constructor(private readonly _dialog: MatDialog) {}

  public async prompt(data: ConfirmationDialogDTO): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const withCallback: ConfirmationDialogInternalDTO = { ...data, callback: resolve };
      this._dialog.open(ConfirmationDialogComponent, { width: data.width, data: withCallback });
    });
  }
}
