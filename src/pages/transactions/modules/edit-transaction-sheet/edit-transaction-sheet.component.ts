import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import * as moment from 'moment';

import {
  creditCategories,
  debitCategories,
  displayableErrors,
  MY_DATE_FORMATS,
  smallScreenBreakpoint,
} from '../../../../shared/constants';
import { AccountDTO, EditTransactionSheetDTO, TransactionDTO } from '../../../../shared/models';
import { ConfirmationDialogService } from '../../../../shared/modules/confirmation-dialog/confirmation-dialog.service';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { ScreenResizeService } from '../../../../shared/services/screen-resize.service';
import { TransactionService } from '../../../../shared/services/transaction.service';
import {
  areTransactionBodiesSame,
  capitalizeFirst,
  noCategoryMismatch,
  positiveAmount,
  tc,
} from '../../../../shared/utils';

/** CategoryErrorMatcher is a custom ErrorStateMatcher for the category mat-select. */
class CategoryErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    // Checking if we can show the error yet (it has nothing to do with the actual value in the control).
    // Notice that we are not using control.dirty or form.submitted checks here.
    // That's because category will initially be populated in the update form.
    const canShowErr = true;
    // Checking if there's actually an error.
    // Category is deemed invalid if its own form-control is invalid or the parent form has category-related errors.
    const hasErr: boolean = control?.invalid || form?.hasError('categoryMismatch') || false;
    // If an error can be shown, and there is actually an error, it is displayed.
    return canShowErr && hasErr;
  }
}

@Component({
  selector: 'app-edit-transaction-sheet',
  templateUrl: './edit-transaction-sheet.component.html',
  styleUrls: ['./edit-transaction-sheet.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class EditTransactionSheetComponent implements OnInit {
  public txForm: FormGroup;

  public isUpdating = false; // For the transaction update call loading.
  public isDeleting = false; // For the transaction delete call loading.
  public isAccountLoading = true; // For the ListAccounts loading.

  public readonly categoryErrorMatcher = new CategoryErrorMatcher();

  public accountList: AccountDTO[] = [];
  public readonly capFirst = capitalizeFirst;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _account: AccountService,
    private readonly _transaction: TransactionService,
    private readonly _snack: SnackbarService,
    private readonly _resize: ScreenResizeService,
    private readonly _confirm: ConfirmationDialogService,
    private readonly _bottomSheetRef: MatBottomSheetRef<EditTransactionSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: EditTransactionSheetDTO,
  ) {
    const { originalTx } = this._data;

    this.txForm = this._formBuilder.group(
      {
        amount: [Math.abs(originalTx.amount), [Validators.required, positiveAmount]],
        nature: [originalTx.amount < 0 ? 'debit' : 'credit', Validators.required],
        date: [moment.unix(originalTx.timestamp), Validators.required],
        account: [originalTx.account_id, Validators.required],
        category: [originalTx.category, Validators.required],
        notes: [originalTx.notes],
      },
      { validators: [noCategoryMismatch] },
    );
  }

  public async ngOnInit(): Promise<void> {
    // Whenever the bottom sheet is closed, we send 'false' to the opener.
    // If the transaction was updated/deleted, 'true' would already have been sent and this 'false' will be ignored.
    const subscription = this._bottomSheetRef.afterDismissed().subscribe(() => {
      this._data.callback(false);
      subscription.unsubscribe();
    });

    // Populating the 'accounts' dropdown.
    this._setAccountLoading(true);
    await this._fetchAccounts();
    this._setAccountLoading(false);
  }

  /**
   * Returns true if the current small can be categorized as a small screen.
   */
  public isSmallScreen(): boolean {
    return this._resize.currentWidth < smallScreenBreakpoint;
  }

  /**
   * Provides the correct list of categories as per the current selected transaction nature.
   */
  public getCategoriesForNature(): string[] {
    return this.txForm.get('nature')?.value === 'debit' ? debitCategories : creditCategories;
  }

  /**
   * Update button click handler.
   */
  public async onUpdate(): Promise<void> {
    if (this.txForm.invalid) return;

    const value = this.txForm.getRawValue();
    const transaction: TransactionDTO = {
      id: this._data.originalTx.id,
      closing_bal: 0, // Will be ignored.
      amount: value.amount * (value.nature === 'debit' ? -1 : 1),
      timestamp: (value.date as moment.Moment).unix(),
      account_id: value.account,
      category: value.category,
      notes: value.notes,
    };

    // If no updates were made, we don't call backend.
    if (areTransactionBodiesSame(transaction, this._data.originalTx)) {
      this._data.callback(false);
      this._bottomSheetRef.dismiss();
      return;
    }

    this._setUpdating(true);
    const [err] = await tc(this._transaction.updateTransaction(transaction));
    this._setUpdating(false);

    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    this._data.callback(true);
    this._snack.success(true, 'Transaction updated.');
    this._bottomSheetRef.dismiss();
  }

  /**
   * Delete button click handler.
   */
  public async onDelete(): Promise<void> {
    const shouldDelete = await this._confirm.prompt({
      width: '400px',
      title: 'Deleting transaction',
      body: `You are about to permanently delete this transaction.`,
      confirmButtonText: 'Delete',
      confirmButtonColor: 'warn',
      cancelButtonText: 'Cancel',
      cancelButtonColor: undefined,
    });

    if (!shouldDelete) return;

    this._setDeleting(true);
    const [err] = await tc(this._transaction.deleteTransaction(this._data.originalTx.id));
    this._setDeleting(false);

    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    this._data.callback(true);
    this._snack.success(true, 'Transaction deleted.');
    this._bottomSheetRef.dismiss();
  }

  /**
   * Fetches accounts from backend and populates into the UI.
   * @private
   */
  private async _fetchAccounts(): Promise<void> {
    const [err, accounts] = await tc(this._account.listAccounts());
    if (err || !accounts) {
      this._snack.error(true, err?.message || displayableErrors.Default.message);
      return;
    }
    // Updating the UI.
    this.accountList = accounts;
  }

  /**
   * This method sets the state of transaction update.
   * @param state - Intended loading state.
   * @private
   */
  private _setUpdating(state: boolean): void {
    state ? this.txForm.disable() : this.txForm.enable();
    this.isUpdating = state;

    // If accounts are loading, the account input should not be enabled by the global .enable() call above.
    if (this.isAccountLoading) this._setAccountLoading(this.isAccountLoading);
  }

  /**
   * This method sets the state of transaction deletion.
   * @param state - Intended loading state.
   * @private
   */
  private _setDeleting(state: boolean): void {
    state ? this.txForm.disable() : this.txForm.enable();
    this.isDeleting = state;

    // If accounts are loading, the account input should not be enabled by the global .enable() call above.
    if (this.isAccountLoading) this._setAccountLoading(this.isAccountLoading);
  }

  /**
   * This method sets the state of account loading.
   * @param state - Intended account loading state.
   * @private
   */
  private _setAccountLoading(state: boolean): void {
    state ? this.txForm.get('account')?.disable() : this.txForm.get('account')?.enable();
    this.isAccountLoading = state;
  }
}
