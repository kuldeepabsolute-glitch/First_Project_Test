import { Routes } from '@angular/router';
import { Home } from './home/home';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
	{ path: '', component: Home, canActivate: [AuthGuard] },
	{
		path: 'todo',
		loadComponent: () => import('./todo/todo-list').then(m => m.ToDoList),
		canActivate: [AuthGuard]
	},
	{
		path: 'users',
		loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent),
		canActivate: [AuthGuard]
	},
	{
		path: 'weather',
		loadComponent: () => import('./weather/weather-dashboard').then(m => m.WeatherDashboard),
		canActivate: [AuthGuard]
	},
	{
		path: 'news',
		loadComponent: () => import('./news/news-list.component').then(m => m.NewsListComponent),
		canActivate: [AuthGuard]
	},
	{
		path: 'news/article',
		loadComponent: () => import('./news/news-detail.component').then(m => m.NewsDetailComponent),
		canActivate: [AuthGuard]
	},
	{ path: '**', redirectTo: '/login' }
];
