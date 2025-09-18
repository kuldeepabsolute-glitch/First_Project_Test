import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'news-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="news-detail-page">
      <button class="btn back-btn" (click)="goBack()">← Back to News</button>
      
      <article class="news-article">
        <div class="article-header">
          <div class="article-source">{{ article.source }}</div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <span class="article-time">{{ formatTime(article.publishedAt) }}</span>
          </div>
        </div>
        
        <div class="article-image" [style.backgroundImage]="'url(' + (article.image || 'https://picsum.photos/800/400?random=7') + ')'"></div>
        
        <div class="article-content">
          <p class="article-description">{{ article.description }}</p>
          <div class="article-body">
            <p>{{ article.content }}</p>
            <p>This is a demo news article. In a real implementation, you would fetch the full article content from the news API or redirect to the original article URL.</p>
            <p>The article would contain the complete news story with proper formatting, images, and related content.</p>
          </div>
          
          <div class="article-actions">
            <a [href]="article.originalUrl" target="_blank" class="btn primary">Read Original Article</a>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .news-detail-page { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .back-btn { background: var(--btn-bg); color: var(--btn-text); border: none; padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer; margin-bottom: 2rem; }
    .news-article { background: var(--card-grad-start); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(2,6,23,0.08); }
    .article-header { padding: 2rem 2rem 1rem; }
    .article-source { color: rgba(var(--accent),1); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }
    .article-title { margin: 0 0 1rem 0; color: var(--card-text); font-size: 2rem; line-height: 1.3; }
    .article-meta { color: var(--muted-text); font-size: 0.9rem; }
    .article-image { height: 400px; background-size: cover; background-position: center; }
    .article-content { padding: 2rem; }
    .article-description { font-size: 1.1rem; color: var(--muted-text); margin-bottom: 1.5rem; line-height: 1.6; }
    .article-body { color: var(--card-text); line-height: 1.7; margin-bottom: 2rem; }
    .article-body p { margin-bottom: 1rem; }
    .article-actions { text-align: center; }
    .btn { border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; text-decoration: none; display: inline-block; }
    .btn.primary { background: linear-gradient(90deg, rgba(var(--accent),1), rgba(99,118,255,1)); color: white; }
  `]
})
export class NewsDetailComponent implements OnInit {
  article = {
    title: 'Sample News Article',
    description: 'This is a sample news article description that provides an overview of the story.',
    content: 'Full article content would be displayed here with proper formatting and complete story details.',
    source: 'News Source',
    publishedAt: new Date().toISOString(),
    image: 'https://picsum.photos/800/400?random=7',
    originalUrl: '#'
  };

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // In a real implementation, you would fetch article details based on route params
    this.route.queryParams.subscribe(params => {
      if (params['url']) {
        // Decode and use the URL to fetch article details
        this.article.originalUrl = decodeURIComponent(params['url']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/news']);
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}