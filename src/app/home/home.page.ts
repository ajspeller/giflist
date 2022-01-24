import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular';
import { Gif } from '../interfaces/gif';
import { RedditService } from '../services/reddit.service';
import {
  debounceTime,
  distinctUntilChanged,
  takeWhile,
  skip,
} from 'rxjs/operators';

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

  showComments(gif: Gif): void {}

  async openSettings() {}

  playVideo(evt: Event, gif: Gif): void {}

  loadMore(evt: Event): void {}
}
