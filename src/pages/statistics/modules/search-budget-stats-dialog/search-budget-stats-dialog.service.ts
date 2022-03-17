import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SearchBudgetStatsDialogDTO } from '../../../../shared/models';
import {} from '../../../transactions/modules/search-transaction-dialog/search-transaction-dialog.component';
import { SearchBudgetStatsDialogComponent } from './search-budget-stats-dialog.component';
import { SearchBudgetStatsDialogModule } from './search-budget-stats-dialog.module';

@Injectable({
  providedIn: SearchBudgetStatsDialogModule,
})
export class SearchBudgetStatsDialogService {
  constructor(private readonly _dialog: MatDialog) {}

  /** Opens the search dialog. */
  public async prompt(): Promise<{ startDate: number | undefined; endDate: number | undefined }> {
    return new Promise((resolve) => {
      const data: SearchBudgetStatsDialogDTO = {
        callback: (startDate, endDate) => resolve({ startDate, endDate }),
      };
      this._dialog.open(SearchBudgetStatsDialogComponent, { width: '576px', data });
    });
  }
}
