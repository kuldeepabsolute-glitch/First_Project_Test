import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NewsService, NewsArticle } from './news.service';

@Component({
  selector: 'news-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="news-page">
      <div class="news-header">
        <h2>Latest News</h2>
        <div class="search-bar">
          <input [(ngModel)]="searchQuery" (keyup.enter)="searchNews()" placeholder="Search news..." />
          <button (click)="searchNews()" class="btn primary">Search</button>
        </div>
      </div>

      <div class="categories">
        <button *ngFor="let cat of categories" 
                (click)="selectCategory(cat.key)" 
                [class]="'btn category-btn ' + (selectedCategory === cat.key ? 'active' : '')">
          {{ cat.label }}
        </button>
      </div>

      <div class="news-sections">
        <section *ngFor="let section of newsSections" class="news-section">
          <h3>{{ section.title }}</h3>
          <div class="news-grid">
            <div *ngFor="let article of section.articles" class="news-card" (click)="viewArticle(article)">
              [style.backgroundColor]="article.title | colorFromTitle"
              <div class="news-content">
                <div class="news-source">{{ article.source.name }}</div>
                <h4 class="news-title">{{ article.title }}</h4>
                <p class="news-desc">{{ article.description }}</p>
                <div class="news-time">{{ formatTime(article.publishedAt) }}</div>
              </div>
            </div>
          </div>
          <button class="btn show-more" (click)="loadMore(section.category)">Show More</button>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .news-page { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .news-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .news-header h2 { margin: 0; color: var(--app-text); }
    .search-bar { display: flex; gap: 0.5rem; }
    .search-bar input { padding: 0.75rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; width: 300px; }
    .categories { display: flex; gap: 0.75rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .category-btn { padding: 0.5rem 1rem; border: 1px solid rgba(0,0,0,0.1); border-radius: 20px; background: var(--card-grad-start); }
    .category-btn.active { background: linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color: white; }
    .news-section { margin-bottom: 3rem; }
    .news-section h3 { color: var(--card-text); margin-bottom: 1rem; }
    .news-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .news-card { background: var(--card-grad-start); border-radius: 12px; overflow: hidden; box-shadow: 0 6px 20px rgba(2,6,23,0.04); cursor: pointer; transition: transform 200ms ease; }
    .news-card:hover { transform: translateY(-4px); }
    .news-image { height: 200px; background-size: cover; background-position: center; }
    .news-content { padding: 1.25rem; }
    .news-source { color: rgba(var(--accent),1); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
    .news-title { margin: 0 0 0.75rem 0; color: var(--card-text); font-size: 1.1rem; line-height: 1.4; }
    .news-desc { color: var(--muted-text); margin: 0 0 1rem 0; line-height: 1.5; }
    .news-time { color: var(--muted-text); font-size: 0.85rem; }
    .show-more { background: var(--btn-bg); color: var(--btn-text); border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; }
    .btn { border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn.primary { background: linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color: white; }
  `]
})
export class NewsListComponent implements OnInit {
  searchQuery = '';
  selectedCategory = 'general';
  categories = [
    { key: 'general', label: 'Trending' },
    { key: 'technology', label: 'Tech' },
    { key: 'politics', label: 'Political' },
    { key: 'entertainment', label: 'Entertainment' },
    { key: 'sports', label: 'Sports' },
    { key: 'business', label: 'Business' }
  ];

  newsSections: { title: string; category: string; articles: NewsArticle[] }[] = [];

  constructor(private newsService: NewsService, private router: Router) {}

  ngOnInit() {
    this.loadInitialNews();
  }

  loadInitialNews() {
    // Load trending news
    this.loadCategoryNews('general', 'Trending News');
    this.loadCategoryNews('technology', 'Technology');
    this.loadCategoryNews('politics', 'Politics');
    this.loadCategoryNews('entertainment', 'Entertainment');
  }

  loadCategoryNews(category: string, title: string) {
    // Use mock data for demo - replace with actual API call
    const mockArticles = this.newsService.getMockNews();
    const section = { title, category, articles: mockArticles };
    
    const existingIndex = this.newsSections.findIndex(s => s.category === category);
    if (existingIndex >= 0) {
      this.newsSections[existingIndex] = section;
    } else {
      this.newsSections.push(section);
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    const categoryLabel = this.categories.find(c => c.key === category)?.label || category;
    this.loadCategoryNews(category, categoryLabel);
  }

  searchNews() {
    if (!this.searchQuery.trim()) return;
    
    // Use mock data for demo
    const mockResults = this.newsService.getMockNews();
    this.newsSections = [{ title: `Search Results for "${this.searchQuery}"`, category: 'search', articles: mockResults }];
  }

  loadMore(category: string) {
    // Load more articles for the category
    this.loadCategoryNews(category, this.categories.find(c => c.key === category)?.label || category);
  }

  viewArticle(article: NewsArticle) {
    // Navigate to article detail page
    this.router.navigate(['/news/article'], { queryParams: { url: encodeURIComponent(article.url) } });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }
}