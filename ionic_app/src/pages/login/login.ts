import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { ParticleProvider } from '../../providers/particle/particle';
import { DeviceListComponent } from '../../components/device-list/device-list';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email: string;
  password: string;
  loginFailed: boolean = false;
  loading: boolean = true;
  readyState: string = "loading";
  currentSlide: string = "welcomeSlide";
  selectedDeviceId: string = null;
  selectedDeviceName: string = null;
  @ViewChild('setupSlides') setupSlides: Slides;

  constructor(public navCtrl: NavController, public navParams: NavParams, public particle: ParticleProvider, private storage: Storage) {
  }

  ngAfterViewInit() {
    this.setupSlides.lockSwipes(true);
    this.setupSlides.pager = true;
  }

  ionViewDidLoad() {
    this.doWelcomeSlide();
  }

  doLoginSlide() {
    this.currentSlide = 'loginSlide';
  }

  doWelcomeSlide() {
    if (this.particle.token) {
        this.doDeviceSlide();
        return;
    }
    this.currentSlide = 'welcomeSlide';
    let errorCallback = (error) => { this.particle.logout(); this.loading = false; };
    this.storage.ready().then(
        (ready) => {
            this.storage.get("token").then(
                    (token) => {
                        this.particle.setToken(token).then(
                            (userInfo) => {
                                console.log("User token", this.particle.token);
                                this.loading = false;
                                this.continueButton();
                            },
                            (error) => {
                                console.log("User token invalid", token);
                                this.particle.logout();
                                this.loading = false;
                            }
                        );
                    },
                    errorCallback
                );
        }, 
        errorCallback
    );
  }
  
  doDeviceSlide() {
    this.currentSlide = 'deviceSlide';
    this.loading = true;

    let fetchDevices = () => {
        this.particle.listDevices().then(
            (devices) => {
                this.loading = false;
            },
            (error) => {
                console.log("Error fetching devices", error);
                this.loading = false;
            }
        ); 
    };

    this.storage.ready().then(
        (ready) => {
            this.storage.get("deviceId").then(
                (deviceId) => {
                    if (deviceId && deviceId.length) {
                        this.particle.setDevice(deviceId).then(
                            (device) => {
                                this.onDeviceSelect(device);
                            },
                            (error) => {
                                fetchDevices();
                            }
                        );
                    } else {
                        console.log("No deviceId, fetching devices");
                        fetchDevices();
                    }
                },
                (error) => {
                    fetchDevices();
                }
            );
        },
        (error) => {
            fetchDevices();
        }
    );
  }


  doReadySlide(deviceId? : string) {
    this.currentSlide = 'readySlide';
    this.readyState = "loading";
    let setDevice = (deviceId) => {
        this.particle.setDevice(deviceId).then(
            (device) => {
                if (device["connected"]) {
                    this.readyState = 'ready';
                } else {
                    this.readyState = 'offline';
                }
            },
            (error) => {
                this.readyState = 'notfound';
            }
        );
    }

    if (deviceId) {
        setDevice(deviceId);
    } else {
        this.doDeviceSlide();
    }
  }

  doLogin() {
    this.particle.login( this.email, this.password ).then(
        (data) => {
            console.log("Login succeeded", data);
            this.loginFailed = false;
            this.doReadySlide();
        },
        (error) => {
            this.loginFailed = true;
        }
    );
  }

  continueButton() {
    if (!this.particle.token) {
       console.log("No particle token");
       this.doLoginSlide(); 
    } else {
        this.doDeviceSlide();
    }
  }

  continueAnyway() {
    this.particle.setDevice(this.selectedDeviceId);
    this.navCtrl.pop();
  }

  reselect() {
    this.storage.ready().then(
        (ready) => {
            this.storage.remove("deviceId").then(
                (ready) => {
                    this.doDeviceSlide();
                },
                (error) => {
                    this.doDeviceSlide();
                }
            );
        },
        (error) => {
            this.doDeviceSlide();
        }
    );
  }

  onDeviceSelect(device) {
    this.selectedDeviceName = device["name"];
    this.selectedDeviceId = device["id"];
    this.doReadySlide(device["id"]);
  }

}
