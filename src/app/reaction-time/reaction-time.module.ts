import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactionTimeComponent } from './reaction-time.component';

const routes: Routes = [
  { path: '', component: ReactionTimeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactionTimeComponent
  ]
})
export class ReactionTimeModule { }