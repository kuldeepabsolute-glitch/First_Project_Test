import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AuthGuard } from './auth/auth.guard';
import { LoginGuard } from './auth/login.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent), canActivate: [LoginGuard] },
	{ path: '', component: Home },
	{
		path: 'todo',
		loadComponent: () => import('./todo/todo-list').then(m => m.ToDoList)
	},
	{
		path: 'users',
		loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent)
	},
	{
		path: 'weather',
		loadComponent: () => import('./weather/weather-dashboard').then(m => m.WeatherDashboard)
	},
	{
		path: 'news',
		loadComponent: () => import('./news/news-list.component').then(m => m.NewsListComponent)
	},
	{
		path: 'news/article',
		loadComponent: () => import('./news/news-detail.component').then(m => m.NewsDetailComponent)
	},
	{
		path: 'tic-tac-toe',
		loadChildren: () => import('./tic-tac-toe/tic-tac-toe.module').then(m => m.TicTacToeModule)
	},
	{
		path: 'snake-game',
		loadChildren: () => import('./snake-game/snake-game.module').then(m => m.SnakeGameModule)
	},
	{
		path: 'flappy-bird',
		loadChildren: () => import('./flappy-bird/flappy-bird.module').then(m => m.FlappyBirdModule)
	},
	{
		path: 'reaction-time',
		loadChildren: () => import('./reaction-time/reaction-time.module').then(m => m.ReactionTimeModule)
	},
	{ path: '**', redirectTo: '/' }
];
