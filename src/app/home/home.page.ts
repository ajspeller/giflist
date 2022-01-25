import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged,
  takeWhile,
  skip,
} from 'rxjs/operators';

import { IonContent, ModalController } from '@ionic/angular';

import { Browser } from '@capacitor/browser';

import { Gif } from '../interfaces/gif';

import { RedditService } from '../services/reddit.service';
import { SettingsPage } from '../settings/settings.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild(IonContent, { static: false }) contentArea: IonContent;

  gifs: Gif[] = [];
  subredditForm: FormGroup;

  constructor(
    public redditService: RedditService,
    private modalController: ModalController
  ) {
    this.subredditForm = new FormGroup({
      subredditControl: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.redditService.getGifs().subscribe((gifs) => {
      this.gifs = gifs;
    });

    this.subredditForm
      .get('subredditControl')
      .valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((subreddit: string) => {
        if (subreddit.length) {
          this.redditService.reset(subreddit);
          this.contentArea.scrollToTop(200);
        }
      });
  }

  showComments(gif: Gif): void {
    Browser.open({
      toolbarColor: '#fff',
      url: `https://reddit.com${gif.permalink}`,
      windowName: '_system',
    });
  }

  async openSettings(): Promise<void> {
    const modal = await this.modalController.create({
      component: SettingsPage,
    });

    modal.present();

    await modal.onDidDismiss();
    this.redditService.reset();
  }

  playVideo(evt: Event, gif: Gif): void {
    const video = evt.target as HTMLVideoElement;
    if (video.readyState === 4) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } else {
      if (video.getAttribute('data-event-loadeddata') !== 'true') {
        gif.loading = true;
        video.load();
        const handleVideoLoaded = async () => {
          await video.play();
          gif.dataLoaded = true;
          gif.loading = false;
          video.removeEventListener('loadeddata', handleVideoLoaded);
        };
        video.addEventListener('loadeddata', handleVideoLoaded);
        video.setAttribute('data-event-loadeddata', 'true');
      }
    }
  }

  loadMore(evt: Event): void {
    const infiniteElement = evt.target as HTMLIonInfiniteScrollElement;
    if (!this.redditService.loading) {
      this.redditService
        .getLoadingState()
        .pipe(
          skip(1),
          takeWhile((loadingState) => loadingState === true, true)
        )
        .subscribe((loadingState) => {
          if (loadingState === false) {
            infiniteElement.complete();
          }
        });
      this.redditService.nextPage();
    } else {
      infiniteElement.complete();
    }
  }
}
