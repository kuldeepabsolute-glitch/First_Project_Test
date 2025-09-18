import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly KEY = 'weather_favorites_v1';

  getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return [];
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  addFavorite(city: string) {
    const f = this.getFavorites();
    if (!f.includes(city)) {
      f.push(city);
      try { localStorage.setItem(this.KEY, JSON.stringify(f)); } catch {}
    }
  }

  removeFavorite(city: string) {
    const f = this.getFavorites().filter(c => c !== city);
    try { localStorage.setItem(this.KEY, JSON.stringify(f)); } catch {}
  }
}
