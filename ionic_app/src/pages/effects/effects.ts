import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
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
        { "name" : "firestern", "desc" : "Forward Firing Arc", "subtitle" : "Concentrate forward firepower!" },
        { "name" : "fireport", "desc" : "Left Firing Arc", "subtitle" : "Port turbolasers!" },
        { "name" : "firestar", "desc" : "Right Firing Arc", "subtitle" : "Starboard turbolasers!" },
        { "name" : "wash", "desc" : "Engine Spinup", "subtitle" : "Ahead full!" },
        { "name" : "pewpew", "desc" : "Pew pew!", "subtitle" : "Lazers..." },
        { "name" : "march", "desc" : "Imperial March!", "subtitle" : "Duhh Duhh Duhhhhh..." }
    ];
  }

  playEffect(effect: any) {
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
