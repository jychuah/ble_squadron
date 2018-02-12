import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { ParticleProvider } from '../../providers/particle/particle';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-effects',
  templateUrl: 'effects.html'
})
export class EffectsPage {
  public effects: any;
  
  constructor(public navCtrl: NavController, public particle: ParticleProvider, private alertCtrl: AlertController) {
    this.effects = [ 
        { "name" : "pewpew", "desc" : "Pew-Pew!", "subtitle" : "Lazers..." },
        { "name" : "march", "desc" : "Imperial March", "subtitle" : "Duhh duhh duhhhhhhh" }
    ];
  }

  playEffect(effect: any) {
    console.log("Play effect", effect);
    this.particle.callFunction("effect", effect.name).then(
        (data) => {
            console.log("effect function called", data);
        },
        (error) => {
            console.log("effect function error", error);
            let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "Could not play effect",
                buttons: ['Dismiss']
            });
            alert.present();
        }
    );
 
  }
}
