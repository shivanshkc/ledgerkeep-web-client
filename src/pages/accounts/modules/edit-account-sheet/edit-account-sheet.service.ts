import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { AccountDTO, EditAccountSheetDTO } from '../../../../shared/models';
import { EditAccountSheetComponent } from './edit-account-sheet.component';
import { EditAccountSheetModule } from './edit-account-sheet.module';

@Injectable({
  providedIn: EditAccountSheetModule,
})
export class EditAccountSheetService {
  constructor(private readonly _bottomSheet: MatBottomSheet) {}

  /**
   * Opens an account edit/deletion sheet and returns the updates to be made to the table.
   */
  public async open(originalAcc: AccountDTO): Promise<boolean> {
    return new Promise((resolve) => {
      const data: EditAccountSheetDTO = { originalAcc, callback: resolve };
      this._bottomSheet.open(EditAccountSheetComponent, { data });
    });
  }
}
