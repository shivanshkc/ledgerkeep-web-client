import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { EditTransactionSheetDTO, TransactionDTO } from '../../../../shared/models';
import { EditTransactionSheetComponent } from './edit-transaction-sheet.component';
import { EditTransactionSheetModule } from './edit-transaction-sheet.module';

@Injectable({
  providedIn: EditTransactionSheetModule,
})
export class EditTransactionSheetService {
  constructor(private readonly _bottomSheet: MatBottomSheet) {}

  /**
   * Opens a transaction edit sheet and returns the transaction edit/delete data.
   */
  public async open(originalTx: TransactionDTO): Promise<boolean> {
    return new Promise((resolve) => {
      const data: EditTransactionSheetDTO = { originalTx, callback: resolve };
      // This class can be used in the global CSS file to style this sheet.
      const panelClass = 'edit-transaction-sheet';
      this._bottomSheet.open(EditTransactionSheetComponent, { data, panelClass });
    });
  }
}
