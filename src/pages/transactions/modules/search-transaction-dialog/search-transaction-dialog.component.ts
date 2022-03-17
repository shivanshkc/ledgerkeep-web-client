import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';

import { allCategories, displayableErrors, MY_DATE_FORMATS, smallScreenBreakpoint } from '../../../../shared/constants';
import { AccountDTO, SearchTransactionsDialogDTO } from '../../../../shared/models';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { AccountService } from '../../../../shared/services/account.service';
import { ScreenResizeService } from '../../../../shared/services/screen-resize.service';
import { capitalizeFirst, tc } from '../../../../shared/utils';

const endAmountValidator = (form: FormGroup): ValidationErrors | null => {
  const startAmount = form.get('startAmount')?.value;
  const endAmount = form.get('endAmount')?.value;

  const startAmountParsed = parseFloat(startAmount);
  const endAmountParsed = parseFloat(endAmount);

  if (isNaN(startAmountParsed) || isNaN(endAmountParsed)) return null;
  if (startAmountParsed > endAmountParsed) return { endAmountLow: true };
  return null;
};

/** Custom error state matcher for end amount. */
class EndAmountErrorMatcher implements ErrorStateMatcher {
  isErrorState(control: AbstractControl | null, form: FormGroupDirective | NgForm | null): boolean {
    // Checking if we can show the error yet (it has nothing to do with the actual value in the control).
    const canShowErr: boolean = control?.dirty || form?.submitted || false;
    // Checking if there's actually an error.
    // Category is deemed invalid if its own form-control is invalid or the parent form has category-related errors.
    const hasErr: boolean = control?.invalid || form?.hasError('endAmountLow') || false;
    // If an error can be shown, and there is actually an error, it is displayed.
    return canShowErr && hasErr;
  }
}

@Component({
  selector: 'app-search-transaction-dialog',
  templateUrl: './search-transaction-dialog.component.html',
  styleUrls: ['./search-transaction-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class SearchTransactionDialogComponent implements OnInit {
  public searchForm: FormGroup;

  public isAccountLoading = true; // For the ListAccounts loading.

  public accountList: AccountDTO[] = [];
  public readonly allCategories = allCategories;
  public readonly capFirst = capitalizeFirst;

  public readonly endAmountErrMatcher = new EndAmountErrorMatcher();

  constructor(
    private readonly _resize: ScreenResizeService,
    private readonly _snack: SnackbarService,
    private readonly _formBuilder: FormBuilder,
    private readonly _account: AccountService,
    private readonly _router: Router,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _dialogRef: MatDialogRef<SearchTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly _data: SearchTransactionsDialogDTO,
  ) {
    this.searchForm = this._formBuilder.group(
      {
        startAmount: [''],
        endAmount: [''],
        startDate: [''],
        endDate: [''],
        account: [''],
        category: [''],
        notesHint: [''],
      },
      {
        validators: [endAmountValidator],
      },
    );
  }

  public async ngOnInit(): Promise<void> {
    // If the dialog closes, we send a 'false' to the opener.
    // It will be ignored if the dialog was closed after pressing 'Search'.
    const subscription = this._dialogRef.afterClosed().subscribe(() => {
      this._data.callback(false);
      subscription.unsubscribe();
    });

    // Populating the 'accounts' dropdown.
    this._setAccountLoading(true);
    await this._fetchAccounts();
    this._setAccountLoading(false);

    // Populating form based on the query params.
    await this._populateFormFromQuery();
  }

  /**
   * On-click handler for the clear button.
   */
  public async onClearClick(): Promise<void> {
    this.searchForm.reset();
  }

  /**
   * On-click handler for the search button.
   */
  public async onSearchClick(): Promise<void> {
    if (this.searchForm.invalid) return;

    await this._populateQueryFromForm();
    // It is important that we send back 'true' before closing the dialog.
    // Otherwise, the dialog.afterClosed subscription may send a 'false' first.
    this._data.callback(true);
    this._dialogRef.close();
  }

  /**
   * On-click handler for the cancel button.
   */
  public async onCancelClick(): Promise<void> {
    this._data.callback(false);
    this._dialogRef.close();
  }

  /**
   * Returns true if the current small can be categorized as a small screen.
   */
  public isSmallScreen(): boolean {
    return this._resize.currentWidth < smallScreenBreakpoint;
  }

  /**
   * Populates the form using query params.
   * @private
   */
  private async _populateFormFromQuery(): Promise<void> {
    const params = await firstValueFrom(this._activatedRoute.queryParamMap);

    const startAmount = parseFloat(params.get('start_amount') || '');
    if (!isNaN(startAmount)) this.searchForm.get('startAmount')?.setValue(startAmount);

    const endAmount = parseFloat(params.get('end_amount') || '');
    if (!isNaN(endAmount)) this.searchForm.get('endAmount')?.setValue(endAmount);

    const startDateInt = parseInt(params.get('start_time') || '');
    const startDate = moment.unix(startDateInt);
    if (startDate.isValid()) this.searchForm.get('startDate')?.setValue(startDate);

    const endDateInt = parseInt(params.get('end_time') || '');
    const endDate = moment.unix(endDateInt);
    if (endDate.isValid()) this.searchForm.get('endDate')?.setValue(endDate);

    const accountID = params.get('account_id');
    if (accountID && this.accountList.find((acc) => acc.id === accountID)) {
      this.searchForm.get('account')?.setValue(accountID);
    }

    const category = params.get('category');
    if (category && this.allCategories.includes(category.toLowerCase())) {
      this.searchForm.get('category')?.setValue(category.toLowerCase());
    }

    const notesHint = params.get('notes_hint');
    if (notesHint) this.searchForm.get('notesHint')?.setValue(notesHint);
  }

  /**
   * Converts the form values into query parameter map and navigates to them.
   * @private
   */
  private async _populateQueryFromForm(): Promise<void> {
    const value = this.searchForm.getRawValue();
    // Getting the current query params.
    const query = await firstValueFrom(this._activatedRoute.queryParams);
    const newQuery = { ...query };

    const startAmount = parseFloat(value.startAmount);
    if (!isNaN(startAmount)) newQuery['start_amount'] = `${startAmount}`;
    else delete newQuery['start_amount'];

    const endAmount = parseFloat(value.endAmount);
    if (!isNaN(endAmount)) newQuery['end_amount'] = `${endAmount}`;
    else delete newQuery['end_amount'];

    if (moment.isMoment(value.startDate)) newQuery['start_time'] = (value.startDate as moment.Moment).unix();
    else delete newQuery['start_time'];

    if (moment.isMoment(value.endDate)) newQuery['end_time'] = (value.endDate as moment.Moment).unix();
    else delete newQuery['end_time'];

    if (value.account !== '') newQuery['account_id'] = value.account;
    else delete newQuery['account_id'];

    if (value.category !== '') newQuery['category'] = value.category;
    else delete newQuery['category'];

    if (value.notesHint !== '') newQuery['notes_hint'] = value.notesHint;
    else delete newQuery['notes_hint'];

    // Navigating to the new query params.
    await this._router.navigate([], { queryParams: newQuery });
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
   * This method sets the state of account loading.
   * @param state - Intended account loading state.
   * @private
   */
  private _setAccountLoading(state: boolean): void {
    state ? this.searchForm.get('account')?.disable() : this.searchForm.get('account')?.enable();
    this.isAccountLoading = state;
  }
}
