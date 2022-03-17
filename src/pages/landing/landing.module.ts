import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule, Routes } from '@angular/router';

import { GlobalModule } from '../../shared/modules/global/global.module';
import { LoginCardComponent } from './components/login-card/login-card.component';
import { LandingComponent } from './landing.component';

// Routes for the Landing module.
const routes: Routes = [{ path: '**', component: LandingComponent }];

@NgModule({
  declarations: [LandingComponent, LoginCardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GlobalModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class LandingModule {}
