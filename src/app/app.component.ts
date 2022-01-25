import { Component } from '@angular/core';

import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';

import { Storage } from '@ionic/storage-angular';

import { RedditService } from './services/reddit.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private redditService: RedditService, private storage: Storage) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.storage.create();
    this.redditService.reset();

    SplashScreen.hide().catch((err) => {
      console.warn(err);
    });

    StatusBar.setBackgroundColor({ color: 'e#74c3c' }).catch((err) => {
      console.warn(err);
    });
  }
}
