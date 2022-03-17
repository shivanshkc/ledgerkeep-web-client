import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';

import { MY_DATE_FORMATS, smallScreenBreakpoint } from '../../../../shared/constants';
import { SearchBudgetStatsDialogDTO } from '../../../../shared/models';
import { SnackbarService } from '../../../../shared/modules/snackbar/snackbar.service';
import { ScreenResizeService } from '../../../../shared/services/screen-resize.service';

@Component({
  selector: 'app-search-budget-stats-dialog',
  templateUrl: './search-budget-stats-dialog.component.html',
  styleUrls: ['./search-budget-stats-dialog.component.scss'],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
})
export class SearchBudgetStatsDialogComponent implements OnInit {
  public searchForm: FormGroup;

  constructor(
    private readonly _resize: ScreenResizeService,
    private readonly _snack: SnackbarService,
    private readonly _formBuilder: FormBuilder,
    private readonly _dialogRef: MatDialogRef<SearchBudgetStatsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private readonly _data: SearchBudgetStatsDialogDTO,
  ) {
    this.searchForm = this._formBuilder.group({ startDate: [''], endDate: [''] });
  }

  public ngOnInit(): void {
    // If the dialog closes, we send an empty signal to the opener.
    // It will be ignored if the dialog was closed after pressing 'Search'.
    const subscription = this._dialogRef.afterClosed().subscribe(() => {
      this._data.callback(undefined, undefined);
      subscription.unsubscribe();
    });
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

    let { startDate, endDate } = this.searchForm.getRawValue();
    startDate = moment.isMoment(startDate) ? startDate.unix() : undefined;
    endDate = moment.isMoment(endDate) ? endDate.unix() : undefined;

    // It is important that we send back the search data before closing the dialog.
    // Otherwise, the dialog.afterClosed subscription may send the empty signal first.
    this._data.callback(startDate, endDate);
    this._dialogRef.close();
  }

  /**
   * On-click handler for the cancel button.
   */
  public async onCancelClick(): Promise<void> {
    this._data.callback(undefined, undefined);
    this._dialogRef.close();
  }

  /**
   * Returns true if the current small can be categorized as a small screen.
   */
  public isSmallScreen(): boolean {
    return this._resize.currentWidth < smallScreenBreakpoint;
  }
}
