import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParticleProgressComponent } from './particle-progress';

@NgModule({
  declarations: [
    ParticleProgressComponent,
  ],
  imports: [
    IonicPageModule.forChild(ParticleProgressComponent),
  ],
  exports: [
    ParticleProgressComponent
  ]
})
export class ParticleProgressComponentModule {}
