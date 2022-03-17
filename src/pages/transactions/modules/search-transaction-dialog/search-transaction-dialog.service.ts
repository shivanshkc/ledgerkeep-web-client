import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SearchTransactionsDialogDTO } from '../../../../shared/models';
import { SearchTransactionDialogComponent } from './search-transaction-dialog.component';
import { SearchTransactionDialogModule } from './search-transaction-dialog.module';

@Injectable({
  providedIn: SearchTransactionDialogModule,
})
export class SearchTransactionDialogService {
  constructor(private readonly _dialog: MatDialog) {}

  public async prompt(): Promise<boolean> {
    return new Promise((resolve) => {
      const data: SearchTransactionsDialogDTO = { callback: resolve };
      this._dialog.open(SearchTransactionDialogComponent, { width: '576px', data });
    });
  }
}
