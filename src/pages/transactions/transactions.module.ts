import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';

import { GlobalModule } from '../../shared/modules/global/global.module';
import { CreateTransactionSheetModule } from './modules/create-transaction-sheet/create-transaction-sheet.module';
import { EditTransactionSheetModule } from './modules/edit-transaction-sheet/edit-transaction-sheet.module';
import { SearchTransactionDialogModule } from './modules/search-transaction-dialog/search-transaction-dialog.module';
import { TransactionsComponent } from './transactions.component';

// Routes for the Transactions module.
const routes: Routes = [{ path: '**', component: TransactionsComponent }];

@NgModule({
  declarations: [TransactionsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GlobalModule,
    FlexLayoutModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    CreateTransactionSheetModule,
    EditTransactionSheetModule,
    SearchTransactionDialogModule,
    MatSortModule,
  ],
})
export class TransactionsModule {}
