// No markdown fences to remove in this file.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar.component';
import { WeatherListComponent } from './weather-list.component';
import { WeatherService } from './weather.service';
import { StorageService } from './storage.service';

@Component({
  standalone: true,
  selector: 'weather-dashboard',
  imports: [CommonModule, SearchBarComponent, WeatherListComponent],
  template: `
    <div class="weather-page">
      <header class="weather-header">
        <div class="current-location">
          <h4>Your location</h4>
          <div *ngIf="!currentLocationWeather && !geoError">Fetching current location…</div>
          <div *ngIf="geoError" class="geo-error">{{ geoError }}</div>
          <div *ngIf="currentLocationWeather" class="cur-card">
            <div class="cur-left">
              <div class="city">{{ currentLocationWeather.name }}{{ currentLocationWeather.sys?.country ? (', ' + currentLocationWeather.sys.country) : '' }}</div>
              <div class="desc">{{ currentLocationWeather.weather?.[0]?.description }}</div>
            </div>
            <div class="cur-right">
              <div class="temp">{{ formatTemp(currentLocationWeather.main?.temp) }}°C</div>
              <div class="wind">{{ currentLocationWeather.wind?.speed }} m/s</div>
            </div>
          </div>
        </div>
        <h2>Weather Dashboard</h2>
      </header>
      <search-bar (search)="onSearch($event)"></search-bar>

      <section class="search-results" *ngIf="results?.length">
        <h3>Search results</h3>
        <weather-list [cities]="results" [favorites]="favoriteNames" (favoriteChange)="onFavoriteChange($event)"></weather-list>
      </section>

      <section class="top-cities">
        <h3>Top cities</h3>
  <weather-list [cities]="topCitiesData" [favorites]="favoriteNames" (favoriteChange)="onFavoriteChange($event)" (reorder)="onTopReorder($event)"></weather-list>
      </section>

      <section class="favorites" *ngIf="favoritesData.length">
        <h3>Favorites</h3>
  <weather-list [cities]="favoritesData" [favorites]="favoriteNames" (favoriteChange)="onFavoriteChange($event)" (reorder)="onFavoritesReorder($event)"></weather-list>
      </section>
    </div>
  `,
  styles: [
    `.weather-page { padding: 1rem } h2 { margin: 0 0 0.5rem 0 }
    .current-location { margin-bottom: 0.75rem }
    .cur-card { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:0.9rem; border-radius:12px; background: linear-gradient(135deg, rgba(var(--accent),0.12), rgba(255,255,255,0.02)); border: 1px solid rgba(var(--accent),0.12); box-shadow: 0 8px 30px rgba(2,6,23,0.08); }
    .cur-left .city { font-weight:800; color: var(--card-text) }
    .cur-left .desc { color: var(--muted-text); margin-top:4px }
    .cur-right .temp { font-size:1.5rem; font-weight:800; color: rgb(var(--accent)) }
    .cur-right .wind { color: var(--muted-text); font-size:0.85rem }
    
    @media (max-width: 768px) {
      .weather-page { padding: 0.5rem; }
      .cur-card { flex-direction: column; align-items: stretch; text-align: center; gap: 0.75rem; }
      .cur-right { align-items: center; }
      h2 { font-size: 1.5rem; text-align: center; }
      h3 { font-size: 1.2rem; }
    }
    
    @media (max-width: 480px) {
      .weather-page { padding: 0.25rem; }
      .cur-card { padding: 0.75rem; }
      .cur-right .temp { font-size: 1.3rem; }
      h2 { font-size: 1.3rem; }
    }
    `
  ]
})
export class WeatherDashboard {
  currentLocationWeather: any = null;
  geoError: string | null = null;
  results: Array<any> = [];
  topCities = ['Mumbai','Delhi','Bengaluru','Hyderabad','Ahmedabad'];
  topCitiesData: any[] = [];
  favoritesData: any[] = [];
  favoriteNames: string[] = [];

  constructor(private svc: WeatherService, private storage: StorageService) {
    this.loadTopCities();
    this.loadFavorites();
    this.favoriteNames = this.storage.getFavorites();
    // request current location weather (non-blocking)
    this.fetchCurrentLocationWeather();
  }

  async fetchCurrentLocationWeather() {
    if (!('geolocation' in navigator)) {
      this.geoError = 'Geolocation not available';
      return;
    }
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const data = await this.svc.getCurrentWeatherByCoords(lat, lon);
      this.currentLocationWeather = data;
    } catch (err: any) {
      this.geoError = err?.message || 'Unable to get location';
    }
  }

  formatTemp(v: any) {
    if (v == null) return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    const c = n > 80 ? (n - 273.15) : n;
    return Math.round(c * 10) / 10;
  }

  async loadTopCities() {
    const rows = [];
    for (const c of this.topCities) {
      // fetch but don't await too long
      const d = await this.svc.getCurrentWeather(c);
      rows.push(d);
    }
    this.topCitiesData = rows;
  }

  loadFavorites() {
    const favs = this.storage.getFavorites();
    this.favoriteNames = favs;
    // for simplicity, fetch live data for each favorite
    Promise.all(favs.map((c: string) => this.svc.getCurrentWeather(c))).then(r => this.favoritesData = r);
  }

  async onSearch(term: string) {
    if (!term) return;
    const data = await this.svc.getCurrentWeather(term);
    this.results = [data];
  }

  onFavoriteChange(city: string) {
    const favs = this.storage.getFavorites();
    if (favs.includes(city)) {
      this.storage.removeFavorite(city);
    } else {
      this.storage.addFavorite(city);
    }
    this.loadFavorites();
    this.favoriteNames = this.storage.getFavorites();
  }

  onTopReorder(newOrder: any[]) {
    // update top cities order (keeps objects)
    this.topCitiesData = newOrder;
  }

  onFavoritesReorder(newOrder: any[]) {
    // update favoritesData and persist the new name order
    this.favoritesData = newOrder;
    const names = newOrder.map(n => n?.name).filter(Boolean);
    try { localStorage.setItem('weather_favorites_v1', JSON.stringify(names)); } catch {}
    this.favoriteNames = names;
  }
}
