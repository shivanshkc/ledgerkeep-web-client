import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

import {
  accountIDMaxLength,
  accountIDRegex,
  accountNameMaxLength,
  accountNameRegex,
} from '../../../../shared/constants';
import { CreateAccountSheetDTO } from '../../../../shared/models';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { tc } from '../../../../shared/utils';

@Component({
  selector: 'app-create-account-sheet',
  templateUrl: './create-account-sheet.component.html',
  styleUrls: ['./create-account-sheet.component.scss'],
})
export class CreateAccountSheetComponent implements OnInit {
  public accountForm: FormGroup;
  public isLoading = false;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _account: AccountService,
    private readonly _snack: SnackbarService,
    private readonly _bottomSheetRef: MatBottomSheetRef<CreateAccountSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: CreateAccountSheetDTO,
  ) {
    this.accountForm = this._formBuilder.group({
      accountID: [
        '',
        [Validators.required, Validators.maxLength(accountIDMaxLength), Validators.pattern(accountIDRegex)],
      ],
      accountName: [
        '',
        [Validators.required, Validators.maxLength(accountNameMaxLength), Validators.pattern(accountNameRegex)],
      ],
    });
  }

  ngOnInit(): void {
    // Whenever the bottom sheet is closed, we send 'false' to the opener.
    // If an account was created, 'true' would already have been sent and this 'false' will be ignored.
    const subscription = this._bottomSheetRef.afterDismissed().subscribe(() => {
      this._data.callback(false);
      subscription.unsubscribe();
    });
  }

  /**
   * Form submission handler.
   */
  public async onSubmit(): Promise<void> {
    if (this.accountForm.invalid) return;

    this._setLoading(true);
    await this._createAccount();
    this._setLoading(false);
  }

  /**
   * This method creates the account while also managing corresponding UI actions
   * These UI actions may include form resetting, replying to the opener and dismissing the sheet etc.
   * @private
   */
  private async _createAccount(): Promise<void> {
    if (this.accountForm.invalid) return;
    const { accountID, accountName } = this.accountForm.getRawValue();

    const [err] = await tc(this._account.createAccount(accountID, accountName));
    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    this.accountForm.reset();
    this._bottomSheetRef.dismiss();
    this._data.callback(true);
    this._snack.success(true, 'Account created.');
  }

  /**
   * This method sets the state of loading.
   * @param state - Intended loading state.
   * @private
   */
  private _setLoading(state: boolean): void {
    state ? this.accountForm.disable() : this.accountForm.enable();
    this.isLoading = state;
  }
}
