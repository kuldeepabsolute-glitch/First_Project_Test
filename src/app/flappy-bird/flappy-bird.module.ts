import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlappyBirdComponent } from './flappy-bird.component';

const routes: Routes = [
  { path: '', component: FlappyBirdComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FlappyBirdComponent
  ]
})
export class FlappyBirdModule { }