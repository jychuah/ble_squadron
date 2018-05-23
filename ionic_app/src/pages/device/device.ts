import { Component, ViewChild } from '@angular/core';
import { NavController, Events, NavParams, Content } from 'ionic-angular';
import { BLEListComponent } from '../../components/blelist/blelist';
import { MultiBLEProvider } from '../../providers/multible/multible';
import { BLE } from '@ionic-native/ble';
import { Storage } from '@ionic/storage';
import { SmartAudioProvider } from '../../providers/smart-audio/smart-audio';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'page-device',
  templateUrl: 'device.html'
})

export class DevicePage {

  @ViewChild('blelist') blelist: BLEListComponent;
  @ViewChild(Content) content: Content;
  public showlist: boolean = true;
  public storage_key : string = "";
  public name: string = "";
  public deviceDisplayName: string = "";
  public device_id: string = "";
  public uart_service_id = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
  public uart_service_rx_id = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
  public services: string[] = [ this.uart_service_id  ] // UART Serial service
  public config: any = { };
  public background: SafeUrl;

  constructor(public navCtrl: NavController, public storage: Storage, public events: Events, 
                public multible: MultiBLEProvider, public navParams: NavParams, public ble: BLE,
                public smartAudio: SmartAudioProvider, public dom: DomSanitizer) {
    this.events.subscribe(this.multible.TOPIC, 
        (event) => {
            if (this.blelist && event.device_id == this.device_id) {
                if (event.event == "connected") {
                    this.storage.set(this.storage_key, this.blelist.selectedDevice);
                    this.hideBleList();
               } 
                if (event.event == "error" || event.event == "disconnected") {
                    this.blelist.setVisibility(true);
                }
            }
        }
    );
  }

  hideBleList() {
    setTimeout(() => { this.blelist.setVisibility(false); setTimeout(() => { this.content.resize() }, 750); }, 1000);
  }

  send(message: string) {
    var device = this.multible.devices[this.device_id];
    if (device && device.connected) {
        this.ble.write(this.device_id, this.uart_service_id, this.uart_service_rx_id, this.multible.stringToBytes(message)).then(
            (data) => { 
                console.log("Write successful", data);
            },
            (error) => {
                console.log("Write error", error);
            }
        );
    }
  }

  runEffect(effect: any) {
    this.send("effect " + effect.name);
    this.smartAudio.play(effect.audio);
  }

  controlSlider(control: any) {
    this.send(control.name + " " + control.value);
  }

  deviceSelected(device_id: string) {
    this.device_id = device_id;
  }

  switchDevice() {
    this.multible.disconnect(this.device_id);
    this.blelist.selectedDevice = "";
  }

  ionViewDidEnter() {
    this.config = this.navParams.get('config');
    this.name = this.config.name;
    this.background = this.dom.bypassSecurityTrustStyle("url('" + this.config.background + "')");
    // this.background = this.config.background;
    if (this.name && this.name.length) {
        this.storage_key = "device" + this.name;
        this.storage.get(this.storage_key).then(
            (data) => {
                this.device_id = data as string;
                this.blelist.selectedDevice = this.device_id;
                if (this.multible.devices[this.device_id]) {
                    this.deviceDisplayName = this.multible.devices[this.device_id].name ? this.multible.devices[this.device_id].name : data;
                }
                if (this.multible.devices[this.device_id] && this.multible.devices[this.device_id].connected) {
                    this.hideBleList();
                }
            }
        );
    }
  }

}
