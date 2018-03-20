import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { SmartAudioProvider } from '../providers/smart-audio/smart-audio';
import { HomePage } from '../pages/home/home';
import { DevicePage } from '../pages/device/device';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  public devices: Array< any >;
  public audioclips: Array< any >;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public smartAudio: SmartAudioProvider) {
    this.initializeApp();

    this.audioclips = [
        { "name" : "siren", "asset" : "assets/audio/T02.wav" },
        { "name" : "turbolaser", "asset" : "assets/audio/T03.wav" },
        { "name" : "enginewash", "asset" : "assets/audio/T04.wav" },
        { "name" : "pewpew", "asset" : "assets/audio/T05.wav" },
        { "name" : "march", "asset" : "assets/audio/T06.wav" }
    ];

    // used for an example of ngFor and navigation
    this.devices = [
        { 
            name: "Imperial Raider", 
            effects: [
                { "name" : "firestern", "desc" : "Forward Firing Arc", "subtitle" : "Concentrate forward firepower!", "audio" : "turbolaser" },
                { "name" : "fireport", "desc" : "Left Firing Arc", "subtitle" : "Port turbolasers!", "audio" : "turbolaser" },
                { "name" : "firestar", "desc" : "Right Firing Arc", "subtitle" : "Starboard turbolasers!", "audio" : "turbolaser" },
                { "name" : "wash", "desc" : "Engine Spinup", "subtitle" : "Ahead full!", "audio" : "enginewash" },
                { "name" : "pewpew", "desc" : "Pew pew!", "subtitle" : "Lazers...", "audio" : "pewpew" },
                { "name" : "march", "desc" : "Imperial March!", "subtitle" : "Duhh Duhh Duhhhhh...", "audio" : "march" }
            ],
            controls: [
                { "name" : "glow", "desc" : "Engine Glow", "min" : 0, "max" : 100, "value" : 30 },
                { "name" : "flicker", "desc" : "Engine Flicker", "min" : 0, "max" : 30, "value" : 15 },
                { "name" : "spotlight", "desc" : "Spotlight", "min" : 0, "max" : 100, "value" : 60 },
            ],
            background: "./assets/imgs/raider.png"
        },
        {
            name: "Millenium Falcon",
            effects: [ ],
            controls: [ ],
            background: "./assets/imgs/falcon.png"
        }
    ];

    for (var clip of this.audioclips) {
        this.smartAudio.preload(clip.name, clip.asset);
    }

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openHome() {
    this.nav.setRoot(HomePage);
  }

  openDevice(device) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(DevicePage, { config: device });
  }
}
