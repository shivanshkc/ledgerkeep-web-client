import { Injectable } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { CreateAccountSheetDTO } from '../../../../shared/models';
import { CreateAccountSheetComponent } from './create-account-sheet.component';
import { CreateAccountSheetModule } from './create-account-sheet.module';

@Injectable({
  providedIn: CreateAccountSheetModule,
})
export class CreateAccountSheetService {
  constructor(private readonly _bottomSheet: MatBottomSheet) {}

  /**
   * Opens an account creation sheet and returns the account data if provided.
   */
  public async open(): Promise<boolean> {
    return new Promise((resolve) => {
      const data: CreateAccountSheetDTO = { callback: resolve };
      this._bottomSheet.open(CreateAccountSheetComponent, { data });
    });
  }
}
