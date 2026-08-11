import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ReserveClassListComponent} from "./reserve-class-list/reserve-class-list.component";

const routes: Routes = [
  {
    path: 'list',
    component: ReserveClassListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReserveClassRoutingModule { }
