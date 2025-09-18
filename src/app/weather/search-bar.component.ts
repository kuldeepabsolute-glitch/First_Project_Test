import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'search-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-bar">
      <div class="input-wrap">
      <input #q placeholder="Enter Indian city" (input)="onInput(q.value)" (keyup.enter)="choose(q.value)" aria-autocomplete="list" aria-haspopup="true" aria-controls="city-list" />
        <ul id="city-list" class="suggestions" *ngIf="filtered.length">
          <li *ngFor="let c of filtered" (click)="choose(c)" tabindex="0">{{ c }}</li>
        </ul>
      </div>
      <button class="search-btn" (click)="choose(q.value)">
        <span class="search-icon">🔍</span>
        <span class="search-text">Find</span>
      </button>
    </div>
  `,
  styles: [`
    .search-bar { display:flex; gap:0.5rem; align-items:flex-start }
    .input-wrap { position:relative; flex:1 }
    input { width:100%; padding:0.6rem 0.75rem; border-radius:8px; border:1px solid var(--muted, #ddd); }
    .search-btn { background:linear-gradient(180deg,#4b9 0,#2a7 100%); color:#022; border:none; padding:0.5rem 0.9rem; border-radius:8px; display:flex; gap:0.5rem; align-items:center; cursor:pointer }
    .search-btn:active { transform:translateY(1px) }
    .suggestions { position:absolute; left:0; right:0; top:calc(100% + 6px); background:#fff; border:1px solid #ddd; border-radius:6px; max-height:180px; overflow:auto; box-shadow:0 6px 18px rgba(0,0,0,0.08); padding:0.25rem 0; z-index:40 }
    .suggestions li { list-style:none; padding:0.5rem 0.75rem; cursor:pointer }
    .suggestions li:hover, .suggestions li:focus { background:var(--muted-bg,#f3f3f3); outline:none }
  `]
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();

  // small in-memory list of common US cities (keeps bundle small). Could be replaced with remote autosuggest.
  private US_CITIES = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
  ];

  filtered: string[] = [];

  onInput(v: string) {
    const q = (v || '').trim().toLowerCase();
    if (!q) { this.filtered = []; return; }
    // filter US cities only, startsWith improves relevance
    this.filtered = this.US_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 8);
  }

  choose(v: string) {
    const t = (v || '').trim();
    if (!t) return;
    this.filtered = [];
    this.search.emit(t);
  }

  // handle enter key -> choose
  onSearch(v: string) { this.choose(v); }
}
