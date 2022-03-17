import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Routes } from '@angular/router';

import { GlobalModule } from '../../shared/modules/global/global.module';
import { AccountsComponent } from './accounts.component';
import { CreateAccountSheetModule } from './modules/create-account-sheet/create-account-sheet.module';
import { EditAccountSheetModule } from './modules/edit-account-sheet/edit-account-sheet.module';

// Routes for the Accounts module.
const routes: Routes = [{ path: '**', component: AccountsComponent }];

@NgModule({
  declarations: [AccountsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GlobalModule,
    FlexLayoutModule,
    CreateAccountSheetModule,
    MatProgressBarModule,
    MatTableModule,
    EditAccountSheetModule,
  ],
})
export class AccountsModule {}
