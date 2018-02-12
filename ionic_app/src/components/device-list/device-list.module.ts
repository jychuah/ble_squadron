import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DeviceListComponent } from './device-list';

@NgModule({
  declarations: [
    DeviceListComponent,
  ],
  imports: [
    IonicPageModule.forChild(DeviceListComponent),
  ],
  exports: [
    DeviceListComponent
  ]
})
export class DeviceListComponentModule {}
