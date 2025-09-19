import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TicTacToeComponent } from './tic-tac-toe.component';

const routes: Routes = [
  { path: '', component: TicTacToeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TicTacToeComponent
  ]
})
export class TicTacToeModule { }