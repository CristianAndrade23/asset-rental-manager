import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'assets' },
  {
    path: 'assets',
    loadComponent: () => import('./features/assets/asset-list.page').then((m) => m.AssetListPage),
    title: 'Assets',
  },
  { path: '**', redirectTo: 'assets' },
];
