import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { OnlyLoggedInGuard } from '../shared/guards/only-logged-in.guard';
import { OnlyLoggedOutGuard } from '../shared/guards/only-logged-out.guard';

const routes: Routes = [
  {
    path: 'landing',
    loadChildren: () => import('../pages/landing/landing.module').then((m) => m.LandingModule),
    canActivate: [OnlyLoggedOutGuard],
  },
  {
    path: 'accounts',
    loadChildren: () => import('../pages/accounts/accounts.module').then((m) => m.AccountsModule),
    canActivate: [OnlyLoggedInGuard],
  },
  {
    path: 'transactions',
    loadChildren: () => import('../pages/transactions/transactions.module').then((m) => m.TransactionsModule),
    canActivate: [OnlyLoggedInGuard],
  },
  {
    path: 'statistics',
    loadChildren: () => import('../pages/statistics/statistics.module').then((m) => m.StatisticsModule),
    canActivate: [OnlyLoggedInGuard],
  },
  { path: '**', redirectTo: 'landing', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
