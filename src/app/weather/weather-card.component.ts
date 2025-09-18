import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'weather-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="weather-card">
      <div class="wc-left">
        <div class="city">{{ data?.name }}, {{ data?.sys?.country }}</div>
        <div class="desc">{{ data?.weather?.[0]?.description }}</div>
        <div class="meta">
          <span>Min: {{ formatTemp(data?.main?.temp_min) }}°</span>
          <span>Max: {{ formatTemp(data?.main?.temp_max) }}°</span>
          <span>Humidity: {{ data?.main?.humidity }}%</span>
        </div>
      </div>
      <div class="wc-right">
        <div class="temp">{{ formatTemp(data?.main?.temp) }}°C</div>
        <div class="icon">🌤️</div>
        <div class="wind">Wind: {{ data?.wind?.speed || '-' }} m/s</div>
        <button class="fav-btn" (click)="toggleFavorite()" [attr.aria-pressed]="isFavorite" aria-label="Toggle favorite">
          <span *ngIf="isFavorite">★</span>
          <span *ngIf="!isFavorite">☆</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./weather-card.component.css']
})
export class WeatherCardComponent {
  @Input() data: any;
  @Input() isFavorite = false;
  @Output() favoriteToggle = new EventEmitter<string>();

  // Convert Kelvin to Celsius if input looks like Kelvin (e.g. > 80)
  formatTemp(v: any) {
    if (v == null) return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return v;
    const c = n > 80 ? (n - 273.15) : n; // treat >80 as Kelvin
    return Math.round(c * 10) / 10;
  }

  toggleFavorite() {
    const name = this.data?.name;
    if (!name) return;
    this.favoriteToggle.emit(name);
  }
}
