import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ClassListComponent} from "./class-list/class-list.component";
import {AddClassComponent} from "./add-class/add-class.component";

const routes: Routes = [
  {
    path: 'list',
    component: ClassListComponent
  }, {
    path: 'create-class/:type',
    component: AddClassComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
