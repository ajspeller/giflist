import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

import { SettingsService } from './settings.service';
import { RedditPost } from '../interfaces/reddit-post';
import { Gif } from '../interfaces/gif';
import { Settings } from '../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class RedditService {
  loading = false;
  noPostsRemaining = false;

  private loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private gifs: Gif[] = [];
  private gifs$: BehaviorSubject<Gif[]> = new BehaviorSubject<Gif[]>([]);
  private cancelSearch = false;
  private settings: Settings;
  private after = '';
  private currentPage = 1;
  private timesRetried = 0;

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService
  ) {}

  getGifs(): Observable<Gif[]> {
    return this.gifs$;
  }

  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }
  loadGifsFromActiveSubreddit(): void {}

  getBestSrcForGif(post: RedditPost): string | boolean {
    return false;
  }

  nextPage(): void {}

  async reset(subreddit?: string): Promise<void> {
    return Promise.resolve();
  }
}
