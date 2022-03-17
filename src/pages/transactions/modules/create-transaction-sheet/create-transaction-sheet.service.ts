import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { CreateTransactionSheetDTO } from '../../../../shared/models';
import { CreateTransactionSheetComponent } from './create-transaction-sheet.component';
import { CreateTransactionSheetModule } from './create-transaction-sheet.module';

@Injectable({
  providedIn: CreateTransactionSheetModule,
})
export class CreateTransactionSheetService {
  constructor(private readonly _bottomSheet: MatBottomSheet) {}

  /**
   * Opens a transaction creation sheet and returns the transaction data if provided.
   */
  public async open(): Promise<boolean> {
    return new Promise((resolve) => {
      const data: CreateTransactionSheetDTO = { callback: resolve };
      // This class can be used in the global CSS file to style this sheet.
      const panelClass = 'create-transaction-sheet';
      this._bottomSheet.open(CreateTransactionSheetComponent, { data, panelClass });
    });
  }
}
