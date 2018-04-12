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
        { "name" : "siren", "asset" : "assets/audio/raider/T02.wav" },
        { "name" : "turbolaser", "asset" : "assets/audio/raider/T03.wav" },
        { "name" : "enginewash", "asset" : "assets/audio/raider/T04.wav" },
        { "name" : "pewpew", "asset" : "assets/audio/raider/T05.wav" },
        { "name" : "march", "asset" : "assets/audio/raider/T06.wav" },
        { "name" : "blaster", "asset" : "assets/audio/falcon/blaster.wav" },
        { "name" : "hyperdrive", "asset" : "assets/audio/falcon/hyperdrive.wav" },
        { "name" : "launch", "asset" : "assets/audio/falcon/launch.wav" },
        { "name" : "notmyfault", "asset" : "assets/audio/falcon/notmyfault.wav" },
        { "name" : "watchwhat", "asset" : "assets/audio/falcon/watchwhat.wav" },
        { "name" : "tantivelaunch", "asset" : "assets/audio/tantive/launch.wav" },
        { "name" : "alarm", "asset" : "assets/audio/tantive/alarm.wav" },
        { "name" : "pursuit", "asset" : "assets/audio/tantive/pursuit.wav" },
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
            effects: [ 
                { "name" : "blaster", "desc" : "Turret", "subtitle" : "powpowpowpowpowww!!!", "audio" : "blaster" },
                { "name" : "hyperdrive", "desc" : "Hyperdrive", "subtitle" : "Punch it!", "audio" : "hyperdrive" },
                { "name" : "launch", "desc" : "Launch", "subtitle" : "This piece of junk?", "audio" : "launch" },
                { "name" : "notmyfault", "desc" : "Lando", "subtitle" : "It's not my fault!", "audio" : "notmyfault" },
                { "name" : "watchwhat", "desc" : "Leia", "subtitle" : "Watch what?", "audio" : "watchwhat" }
            ],
            controls: [ 
                { "name" : "glow", "desc" : "Engine Glow", "min" : 0, "max" : 100, "value" : 80 },
                { "name" : "pulse", "desc" : "Engine Pulse", "min" : 0, "max" : 40, "value" : 20 },
                { "name" : "rate", "desc" : "Pulse Rate", "min" : 20, "max" : 100, "value" : 40 },
                { "name" : "headlights", "desc" : "Headlights", "min" : 0, "max" : 100, "value" : 50 },
            ],
            background: "./assets/imgs/falcon.png"
        },
        {
            name: "Tantive IV",
            effects: [ 
                { "name" : "launch", "desc" : "Launch", "subtitle" : "LAAAAAAAUNCCCHH!!!!!", "audio" : "tantivelaunch" },
                { "name" : "alarm", "desc" : "Alarm", "subtitle" : "They've shut down the main reactor", "audio" : "alarm" },
                { "name" : "pursuit", "desc" : "Pursuit", "subtitle" : "We're on a diplomatic mission", "audio" : "pursuit" }
            ],
            controls: [ 
                { "name" : "glow", "desc" : "Engine Glow", "min" : 0, "max" : 100, "value" : 80 },
                { "name" : "flicker", "desc" : "Engine Flicker", "min" : 0, "max" : 50, "value" : 20 },
            ],
            background: "./assets/imgs/falcon.png"
        },
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
