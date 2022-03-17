import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FabComponent } from '../../components/fab/fab.component';
import { LoadingButtonComponent } from '../../components/loading-button/loading-button.component';
import { PageTitleCardComponent } from '../../components/page-title-card/page-title-card.component';
import { ConfirmationDialogModule } from '../confirmation-dialog/confirmation-dialog.module';
import { SnackbarModule } from '../snackbar/snackbar.module';

@NgModule({
  declarations: [LoadingButtonComponent, PageTitleCardComponent, FabComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    SnackbarModule,
    ConfirmationDialogModule,
  ],
  exports: [LoadingButtonComponent, PageTitleCardComponent, SnackbarModule, ConfirmationDialogModule, FabComponent],
})
/**
 * GlobalModule imports and exports all components and other applicable schematics
 * that need to be available to all modules.
 */
export class GlobalModule {}
