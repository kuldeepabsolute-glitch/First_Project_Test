import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'home-page',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['../app.css'],
  imports: [RouterLink]
})
export class Home {}
