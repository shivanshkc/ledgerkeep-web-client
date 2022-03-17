import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import { accountNameMaxLength, accountNameRegex } from '../../../../shared/constants';
import { EditAccountSheetDTO } from '../../../../shared/models';
import { ConfirmationDialogService } from '../../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { formatRupeeAmount, tc } from '../../../../shared/utils';

@Component({
  selector: 'app-edit-account-sheet',
  templateUrl: './edit-account-sheet.component.html',
  styleUrls: ['./edit-account-sheet.component.scss'],
})
export class EditAccountSheetComponent implements OnInit {
  public accountForm: FormGroup;
  public isUpdating = false;
  public isDeleting = false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _account: AccountService,
    private readonly _snack: SnackbarService,
    private readonly _confirm: ConfirmationDialogService,
    private readonly _bottomSheetRef: MatBottomSheetRef<EditAccountSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: EditAccountSheetDTO,
  ) {
    this.accountForm = this._formBuilder.group({
      accountID: [this._data.originalAcc.id],
      accountName: [
        this._data.originalAcc.name,
        [Validators.required, Validators.maxLength(accountNameMaxLength), Validators.pattern(accountNameRegex)],
      ],
      balance: [formatRupeeAmount(this._data.originalAcc.balance)],
    });

    // Disabling inputs that should not be changed.
    this.accountForm.get('accountID')?.disable();
    this.accountForm.get('balance')?.disable();
  }

  ngOnInit(): void {
    // Whenever the bottom sheet is closed, we send 'false' to the opener.
    // If the account was updated/deleted, 'true' would already have been sent and this 'false' will be ignored.
    const subscription = this._bottomSheetRef.afterDismissed().subscribe(() => {
      this._data.callback(false);
      subscription.unsubscribe();
    });
  }

  /**
   * Update button handler.
   */
  public async onUpdate(): Promise<void> {
    if (this.accountForm.invalid) return;

    const { accountName } = this.accountForm.getRawValue();
    if (accountName === this._data.originalAcc.name) {
      this._data.callback(false);
      this._bottomSheetRef.dismiss();
      return;
    }

    // Notice that here we are copying the object.
    // So, modifying its properties will not directly reflect in the table.
    // The table has to do it manually.
    const originalAccount = { ...this._data.originalAcc };
    const accountID = originalAccount.id;

    this._setUpdating(true);
    const [err] = await tc(this._account.updateAccount(accountID, accountName));
    this._setUpdating(false);

    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    originalAccount.name = accountName;
    this._data.callback(true);

    this._snack.success(true, 'Account updated.');
    this._bottomSheetRef.dismiss();
  }

  /**
   * Delete button handler.
   */
  public async onDelete(): Promise<void> {
    const originalAcc = { ...this._data.originalAcc };

    const shouldDelete = await this._confirm.prompt({
      width: '400px',
      title: 'Deleting account',
      body: `You are about to permanently delete account "${originalAcc.name}."`,
      confirmButtonText: 'Delete',
      confirmButtonColor: 'warn',
      cancelButtonText: 'Cancel',
      cancelButtonColor: undefined,
    });

    if (!shouldDelete) return;

    this._setDeleting(true);
    const [err] = await tc(this._account.deleteAccount(originalAcc.id));
    this._setDeleting(false);
    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    this._data.callback(true);
    this._snack.success(true, 'Account deleted.');
    this._bottomSheetRef.dismiss();
  }

  /**
   * This method sets the state of updating (whether the data is being updated or not).
   * @param state - Intended updating state.
   * @private
   */
  private _setUpdating(state: boolean): void {
    state ? this.accountForm.get('accountName')?.disable() : this.accountForm.get('accountName')?.enable();
    this.isUpdating = state;
  }

  /**
   * This method sets the state of deleting (whether the data is being deleted or not).
   * @param state - Intended deleting state.
   * @private
   */
  private _setDeleting(state: boolean): void {
    state ? this.accountForm.get('accountName')?.disable() : this.accountForm.get('accountName')?.enable();
    this.isDeleting = state;
  }
}
