import { Component } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    SplashScreen.hide().catch((err) => {
      console.warn(err);
    });

    StatusBar.setBackgroundColor({ color: 'e#74c3c' }).catch((err) => {
      console.warn(err);
    });
  }
}
