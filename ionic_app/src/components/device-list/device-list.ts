import { Component, Output, EventEmitter } from '@angular/core';
import { ParticleProvider } from '../../providers/particle/particle';

/**
 * Generated class for the DeviceListComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'device-list',
  templateUrl: 'device-list.html'
})
export class DeviceListComponent {
  @Output('onDeviceSelect') onDeviceSelect: EventEmitter<any> = new EventEmitter();
  constructor(public particle: ParticleProvider) {
  }

  selectDevice(device) {
    this.onDeviceSelect.emit(device);
  }
}
