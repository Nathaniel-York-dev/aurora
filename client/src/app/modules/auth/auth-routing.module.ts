import { Routes, RouterModule } from '@angular/router';
import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';


const routes:Routes=[{
  path:'',
  pathMatch:'full',
  component:LoginComponent,
}];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,RouterModule.forChild(routes)
  ]
})
export class AuthRoutingModule { }
