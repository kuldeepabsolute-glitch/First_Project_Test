import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
  content: string;
}

export interface NewsResponse {
  articles: NewsArticle[];
  totalResults: number;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiKey = '99c544a7598b4a0787766d761bfe882a'; // Replace with actual API key
  private baseUrl = 'https://newsapi.org/v2';

  constructor(private http: HttpClient) {}

  getTopHeadlines(country = 'in'): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.baseUrl}/top-headlines?country=${country}&apiKey=${this.apiKey}`);
  }

  getNewsByCategory(category: string, country = 'in'): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.baseUrl}/top-headlines?country=${country}&category=${category}&apiKey=${this.apiKey}`);
  }

  searchNews(query: string, country = 'in'): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.baseUrl}/everything?q=${query}&language=en&sortBy=publishedAt&apiKey=${this.apiKey}`);
  }

  // Fallback mock data for demo
  getMockNews(): NewsArticle[] {
    return [
      {
        title: 'Breaking: Major Tech Innovation in India',
        description: 'Indian tech companies are leading innovation in AI and machine learning sectors with groundbreaking developments.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=1',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Tech India' },
        content: 'Full article content here...'
      },
      {
        title: 'Political Update: New Policy Announced',
        description: 'Government announces new digital infrastructure policy for rural areas to boost connectivity.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=2',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: { name: 'India Today' },
        content: 'Full article content here...'
      },
      {
        title: 'Entertainment: Bollywood Star Wins International Award',
        description: 'Indian cinema continues to gain global recognition with latest international accolade.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=3',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Filmfare' },
        content: 'Full article content here...'
      },
      {
        title: 'Sports: Cricket Team Achieves Historic Victory',
        description: 'Indian cricket team sets new records in international tournament with outstanding performance.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=4',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: { name: 'ESPN Cricinfo' },
        content: 'Full article content here...'
      },
      {
        title: 'Business: Startup Ecosystem Thrives in India',
        description: 'Indian startups continue to attract global investment and drive economic growth.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=5',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Economic Times' },
        content: 'Full article content here...'
      },
      {
        title: 'General: Weather Alert Issued for Northern States',
        description: 'Meteorological department issues weather advisory for several northern Indian states.',
        url: '#',
        urlToImage: 'https://picsum.photos/400/250?random=6',
        publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        source: { name: 'Times of India' },
        content: 'Full article content here...'
      }
    ];
  }
}