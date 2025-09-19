import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherCardComponent } from './weather-card.component';

@Component({
  selector: 'weather-list',
  standalone: true,
  imports: [CommonModule, WeatherCardComponent],
  template: `
    <div class="weather-list grid">
      <ng-container *ngIf="cities?.length; else empty">
        <div class="card-wrap" *ngFor="let c of cities; let i = index"
          draggable="true"
          (dragstart)="onDragStart($event,i)"
          (dragover)="onDragOver($event,i)"
          (drop)="onDrop($event,i)"
          (dragend)="onDragEnd()">
          <weather-card [data]="c" [isFavorite]="isFav(c?.name)" (favoriteToggle)="favoriteChange.emit($event)"></weather-card>
        </div>
      </ng-container>
      <ng-template #empty>
        <p>No results yet. Try searching for a city.</p>
      </ng-template>
    </div>
  `,
  styles: [`.grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.8rem } .card-wrap { cursor:grab } .card-wrap.dragging { opacity:0.5; transform:scale(0.98) } @media (max-width: 768px) { .grid { grid-template-columns:1fr; gap:1rem } } @media (max-width: 1024px) and (min-width: 769px) { .grid { grid-template-columns:repeat(2,1fr) } }`]
})
export class WeatherListComponent {
  @Input() cities: any[] | null = null;
  @Input() favorites: string[] = [];
  @Output() favoriteChange = new EventEmitter<string>();
  @Output() reorder = new EventEmitter<any[]>();

  private draggingIndex: number | null = null;

  isFav(name: string) {
    if (!name) return false;
    return (this.favorites || []).includes(name);
  }

  onDragStart(e: DragEvent, idx: number) {
    this.draggingIndex = idx;
    (e.dataTransfer as DataTransfer).effectAllowed = 'move';
  }

  onDragOver(e: DragEvent, idx: number) {
    e.preventDefault();
    (e.dataTransfer as DataTransfer).dropEffect = 'move';
  }

  onDrop(e: DragEvent, idx: number) {
    e.preventDefault();
    if (this.draggingIndex == null || !this.cities) return;
    const from = this.draggingIndex;
    const to = idx;
    if (from === to) return;
    const arr = [...this.cities];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    this.cities = arr;
    this.reorder.emit(arr);
    this.draggingIndex = null;
  }

  onDragEnd() { this.draggingIndex = null; }
}
