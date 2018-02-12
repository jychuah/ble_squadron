import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ParticleProvider } from '../../providers/particle/particle';
import { ControlsPage } from '../controls/controls';
import { EffectsPage } from '../effects/effects';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private subscription: any = null;
  public tab1root: any = EffectsPage;
  public tab2root: any = ControlsPage;
  
  constructor(public navCtrl: NavController, public particle: ParticleProvider) {

  }

  ionViewDidLoad() {
    if (!this.particle.token) {
    	this.login()
    }
  }

  cancelSubscription() {
    if (this.subscription && this.subscription.cancel) {
        this.subscription.cancel();
    }
    this.subscription = null;
  }

  ionViewDidEnter() {
    if (this.particle.device) {
    } 
  }

  login() {
    this.navCtrl.push( LoginPage );
  }
}
