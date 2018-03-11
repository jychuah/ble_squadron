import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MultiBLEProvider } from '../../providers/multible/multible';
import { Events } from 'ionic-angular';
import { AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations'

/**
 * Generated class for the BlelistComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'blelist',
  templateUrl: 'blelist.html',
  animations: [
    trigger('visibility', [
      state('visible', style({
        height: '*',
        opacity: 1,
      })),
      state('invisible', style({
        height: '0px',
        opacity: 0,
      })),
      transition('* => *', animate('.5s'))
    ])
  ]
})
export class BLEListComponent {

  @Input('selectedDevice') inputDevice: string = "";
  @Input('disableSelect') disableSelect: boolean = false;
  @Input('services') services: string[] = [];
  @Output('deviceSelected') selectEmitter: EventEmitter< string > = new EventEmitter();

  public visibleState: string = "visible"; 
  public selectedDevice: string = "";

  constructor(private multible: MultiBLEProvider, private events: Events) {
    this.multible.startScan(this.services);
  }

  setVisibility(visibility: boolean) {
    if (visibility) {
        this.visibleState = "visible";
    } else {
        this.visibleState = "invisible"
    }
  }

  selectDevice(device_id: any) {
    this.selectedDevice = device_id;
    this.selectEmitter.emit(this.selectedDevice);
    this.multible.connect(device_id);
  }

  enableBluetooth() {
    console.log("BLEListComponent::enableBluetooth");
    this.multible.enableBluetooth();
  }

  stopScanning() {
    console.log("BLEListComponent::stopScanning");
    this.multible.stopScan();
  }

  startScanning() {
    console.log("BLEListComponent::startScanning");
    this.multible.startScan();
  }

  ngAfterViewInit() {
    this.selectedDevice = this.inputDevice;
  }

}
