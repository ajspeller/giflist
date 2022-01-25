import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Settings } from '../interfaces/settings';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  settings: Settings = {
    perPage: 20,
    subreddit: 'gifs',
    sort: 'hot',
  };
  constructor(
    private modalController: ModalController,
    private settingsService: SettingsService
  ) {}

  async ngOnInit() {
    this.settings = await this.settingsService.getSettings();
  }

  close() {
    this.modalController.dismiss();
  }

  save() {
    this.settingsService.save(this.settings);
    this.close();
  }
}
