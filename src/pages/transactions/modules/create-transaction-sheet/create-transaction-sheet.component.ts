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
import { AccountDTO, CreateTransactionSheetDTO, TransactionDTO } from '../../../../shared/models';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { ScreenResizeService } from '../../../../shared/services/screen-resize.service';
import { TransactionService } from '../../../../shared/services/transaction.service';
import { capitalizeFirst, noCategoryMismatch, positiveAmount, tc } from '../../../../shared/utils';

/** CategoryErrorMatcher is a custom ErrorStateMatcher for the category mat-select. */
class CategoryErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    // Checking if we can show the error yet (it has nothing to do with the actual value in the control).
    const canShowErr: boolean = control?.dirty || form?.submitted || false;
    // Checking if there's actually an error.
    // Category is deemed invalid if its own form-control is invalid or the parent form has category-related errors.
    const hasErr: boolean = control?.invalid || form?.hasError('categoryMismatch') || false;
    // If an error can be shown, and there is actually an error, it is displayed.
    return canShowErr && hasErr;
  }
}

@Component({
  selector: 'app-create-transaction-sheet',
  templateUrl: './create-transaction-sheet.component.html',
  styleUrls: ['./create-transaction-sheet.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class CreateTransactionSheetComponent implements OnInit {
  public txForm: FormGroup;

  public isLoading = false; // For the main network call loading.
  public isAccountLoading = true; // For the ListAccounts loading.

  public accountList: AccountDTO[] = [];
  public readonly capFirst = capitalizeFirst;

  public readonly categoryErrorMatcher = new CategoryErrorMatcher();

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _account: AccountService,
    private readonly _transaction: TransactionService,
    private readonly _snack: SnackbarService,
    private readonly _resize: ScreenResizeService,
    private readonly _bottomSheetRef: MatBottomSheetRef<CreateTransactionSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) private _data: CreateTransactionSheetDTO,
  ) {
    this.txForm = this._formBuilder.group(
      {
        amount: ['', [Validators.required, positiveAmount]],
        nature: ['debit', Validators.required],
        date: [moment(), Validators.required],
        account: ['', Validators.required],
        category: ['', Validators.required],
        notes: [''],
      },
      { validators: [noCategoryMismatch] },
    );
  }

  public async ngOnInit(): Promise<void> {
    // Whenever the bottom sheet is closed, we send 'false' to the opener.
    // If a transaction was created, 'true' would already have been sent and this 'false' will be ignored.
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
   * Form submission handler.
   */
  public async onSubmit(): Promise<void> {
    if (this.txForm.invalid) return;

    this._setLoading(true);
    await this._createTransaction();
    this._setLoading(false);
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
   * This method creates the transaction while also managing corresponding UI actions.
   * These UI actions may include form resetting, replying to the opener and dismissing the sheet etc.
   * @private
   */
  private async _createTransaction(): Promise<void> {
    if (this.txForm.invalid) return;

    const value = this.txForm.getRawValue();

    // Transaction that will be created.
    const transaction: TransactionDTO = {
      id: '', // Will be ignored.
      closing_bal: 0, // Will be ignored.
      amount: value.amount * (value.nature === 'debit' ? -1 : 1),
      timestamp: (value.date as moment.Moment).unix(),
      account_id: value.account,
      category: value.category.toLowerCase(),
      notes: value.notes,
    };

    const [err] = await tc(this._transaction.createTransaction(transaction));
    if (err) {
      this._snack.error(true, err.message);
      return;
    }

    this.txForm.reset();
    this._bottomSheetRef.dismiss();
    this._data.callback(true);
    this._snack.success(true, 'Transaction created.');
  }

  /**
   * This method sets the state of loading.
   * @param state - Intended loading state.
   * @private
   */
  private _setLoading(state: boolean): void {
    state ? this.txForm.disable() : this.txForm.enable();
    this.isLoading = state;

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
