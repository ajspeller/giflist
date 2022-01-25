import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, takeWhile, throwIfEmpty } from 'rxjs/operators';

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

  private loading$ = new BehaviorSubject<boolean>(false);
  private gifs: Gif[] = [];
  private gifs$ = new BehaviorSubject<Gif[]>([]);
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

  loadGifsFromActiveSubreddit(): void {
    // build the url
    let url = `https://www.reddit.com/r/${this.settings.subreddit}.json?limit=100&sort=${this.settings.sort}`;

    // only grab post "after" this post if set (allows for pagination)
    if (this.after) {
      url += `&after=${this.after}`;
    }

    this.loading = true;
    this.loading$.next(this.loading);

    this.http
      .get(url)
      .pipe(
        map((response: any) => {
          const posts: RedditPost[] = response.data.children;

          // reddit can no longer return any data, stop searching
          if (posts.length === 0) {
            this.noPostsRemaining = true;
            return [];
          }

          // map the response into the format we want to work with
          const modifiedPosts = posts.map((post) => ({
            src: this.getBestSrcForGif(post),
            author: post.data.author,
            name: post.data.name,
            permalink: post.data.permalink,
            title: post.data.title,
            thumbnail: post.data.thumbnail,
            comments: post.data.num_comments,
            loading: false,
          }));

          // filter out unuseable posts
          const filteredPosts = modifiedPosts.filter(
            (post) => post.src !== false
          );

          if (filteredPosts.length >= this.settings.perPage) {
            // set the "after" variable to the page limit
            this.after = filteredPosts[this.settings.perPage - 1].name;

            // only return enough posts to fillt the page
            return filteredPosts.slice(0, this.settings.perPage);
          } else {
            // set the "after" variable to the last post retrieved (if one exists)
            if (modifiedPosts.length > 0) {
              this.after = modifiedPosts[modifiedPosts.length - 1].name;
            }
            // return however many posts were able to retrieve
            return filteredPosts;
          }
        })
      )
      .subscribe(
        (gifs: Gif[]) => {
          // add new posts that were just pulled in to existing posts
          this.gifs.push(...gifs);
          this.gifs$.next(this.gifs);

          if (this.timesRetried > 10) {
            // We've retried fetching gifs 10 times, time to give up
            console.log('Unable to fetch enough gifs: stopping');
            this.timesRetried = 0;
            this.loading = false;
            this.loading$.next(this.loading);
          } else {
            // keep getting gifs until we have enough to fill a page
            if (
              this.gifs.length < this.settings.perPage * this.currentPage &&
              !this.noPostsRemaining &&
              !this.cancelSearch
            ) {
              this.timesRetried++;
              this.loadGifsFromActiveSubreddit();
            } else {
              this.loading = false;
              this.loading$.next(this.loading);
              this.timesRetried = 0;
            }
          }
        },
        (err) => {
          console.warn(err);
          this.loading = false;
          this.loading$.next(this.loading);
        }
      );
  }

  getBestSrcForGif(post: RedditPost): string | boolean {
    // if the source is in .gifv or .webm formats, convert to .mp4 and return
    if (post.data.url.indexOf('.gifv') >= 0) {
      return post.data.url.replace('.gifv', '.mp4');
    }
    if (post.data.url.indexOf('.webm') >= 0) {
      return post.data.url.replace('.webm', '.mp4');
    }

    // ig yhr url is not .gifv or .webm, check if media or secure media is available
    if (post.data.secure_media?.reddit_video) {
      return post.data.secure_media.reddit_video.fallback_url;
    }
    if (post.data.media?.reddit_video) {
      return post.data.media.reddit_video.fallback_url;
    }

    // if media objects are not available, check if a preview is available
    if (post.data.preview?.reddit_video_preview) {
      return post.data.preview.reddit_video_preview.fallback_url;
    }

    // no useable formats available
    return false;
  }

  nextPage(): void {
    this.currentPage++;
    this.loadGifsFromActiveSubreddit();
  }

  async reset(subreddit?: string): Promise<void> {
    this.cancelSearch = true;

    // wait for any current fetching to finish
    this.getLoadingState()
      .pipe(takeWhile((loadingState) => loadingState === true, true))
      .subscribe(async (loadingState) => {
        if (loadingState === false) {
          this.cancelSearch = false;
          this.currentPage = 1;
          this.gifs = [];
          this.noPostsRemaining = false;
          this.after = null;
          this.settings = await this.settingsService.getSettings();

          if (subreddit) {
            this.settings.subreddit = subreddit;
          }

          this.loadGifsFromActiveSubreddit();
        }
      });
  }
}
