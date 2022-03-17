import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import { GlobalModule } from '../../../../shared/modules/global/global.module';
import { EditTransactionSheetComponent } from './edit-transaction-sheet.component';

@NgModule({
  declarations: [EditTransactionSheetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    GlobalModule,
    MatBottomSheetModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
})
export class EditTransactionSheetModule {}
