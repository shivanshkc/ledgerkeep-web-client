import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { RouterModule, Routes } from '@angular/router';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { GlobalModule } from '../../shared/modules/global/global.module';
import { BudgetStatsComponent } from './components/budget-stats/budget-stats.component';
import { TotalBalanceStatsComponent } from './components/total-balance-stats/total-balance-stats.component';
import { StatisticsComponent } from './statistics.component';

// Routes for the Statistics module.
const routes: Routes = [{ path: '**', component: StatisticsComponent }];

@NgModule({
  declarations: [StatisticsComponent, BudgetStatsComponent, TotalBalanceStatsComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GlobalModule,
    NgxChartsModule,
    FlexLayoutModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatProgressBarModule,
    MatTableModule,
    NgxChartsModule,
  ],
})
export class StatisticsModule {}
