import {  NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { myAccountComponent } from './myaccount.component';
import { MymessagesComponent } from './mymessages/mymessages.component';
import { WalletComponent } from './wallet/wallet.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { GeneralComponent } from './general/general.component';
import { BecomeTutorComponent } from '../become-tutor/become-tutor.component';
import { ClassListComponent } from '../class/class-list/class-list.component';

const routes: Routes = [
  {
    path: '',
    component: myAccountComponent,
    children: [
      {
        path: '',
        redirectTo: 'general',
        pathMatch: 'full',
      },
      {
        path: 'general',
        component: GeneralComponent,
        data: {
          breadcrumb: 'General',
        },
      },
      {
        path: 'myclasses',
        loadChildren: () => import('../class/class.module').then(m => m.ClassModule)
      },
      {
        path: 'reserve-class',
        loadChildren: () => import('../reserve-class/reserve-class.module').then(m => m.ReserveClassModule)
      },
      {
        path: 'watchlist',
        loadComponent: () => import('./watchlist/watchlist.component').then(m => m.WatchlistComponent),
        data: { breadcrumb: 'Watchlist' },
      },
      {
        path: 'attendance-history',
        loadComponent: () => import('./attendance-history/attendance-history.component').then(m => m.AttendanceHistoryComponent),
        data: { breadcrumb: 'Attendance History' },
      },
      {
        path: 'myclasses',
        component: ClassListComponent,
        data: { breadcrumb: 'Classes' },
      },
      {
        path: 'mystudents',
        loadComponent: () => import('./mystudents/mystudents.component').then(m => m.MyStudentsComponent),
        data: { breadcrumb: 'My Students' },
      },
      {
        path: 'mymessages',
        component: MymessagesComponent,
        data: { breadcrumb: 'Messages' },
      },
      {
        path: 'wallet',
        component: WalletComponent,
        data: { breadcrumb: 'Wallet' },
      },
      {
        path: 'privacyPolicy',
        component: PrivacyComponent,
        data: { breadcrumb: 'Privacy' },
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        data: { breadcrumb: 'Change Password' },
      },
    ],
  },
  {
    path: 'tutor',
    component: BecomeTutorComponent,
  },
  {
    path: 'class-list',
    component: ClassListComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class MyaccountModule {}
