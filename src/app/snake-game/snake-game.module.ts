import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SnakeGameComponent } from './snake-game.component';

const routes: Routes = [
  { path: '', component: SnakeGameComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SnakeGameComponent
  ]
})
export class SnakeGameModule { }