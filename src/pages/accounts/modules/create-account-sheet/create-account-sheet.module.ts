import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { GlobalModule } from '../../../../shared/modules/global/global.module';
import { CreateAccountSheetComponent } from './create-account-sheet.component';

@NgModule({
  declarations: [CreateAccountSheetComponent],
  imports: [CommonModule, ReactiveFormsModule, MatBottomSheetModule, MatFormFieldModule, MatInputModule, GlobalModule],
})
export class CreateAccountSheetModule {}
