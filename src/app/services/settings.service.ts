import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import { Settings } from './../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private storage: Storage) {}

  async getSettings(): Promise<Settings> {
    let settings = await this.storage.get('settings');

    if (settings == null) {
      settings = {
        perPage: 20,
        subreddit: 'gifs',
        sort: 'hot',
      };
    }
    return settings;
  }

  save(settings: Settings) {
    this.storage.set('settings', settings);
  }
}
