import { Injectable, NgZone } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { Events } from 'ionic-angular';

export class MultiBLEEvent {
    constructor(public event: string, public device_id: string, public device: any) {
    }
}

export class BLEDeviceInfo {
  public name: string;
  public id: string;
  public connected: boolean = false;
  public connecting: boolean = false;
  public stored: boolean = false;
  public advertising: any;
  public characteristics: any;
  public rssi: any;
  public services: any;
}

/*
  Generated class for the MultiBLEProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MultiBLEProvider {
  public devices: any = { }; 
  public device_ids: string[] = [];
  public stored_devices: any = { };
  public scanning: boolean = false;
  public isEnabled: boolean = false;
  public reconnecting: boolean = false;
  private STORAGE_KEY: string = "multible_devices";
  public TOPIC: string = "multible";
  private reconnect_devices: any = { };
  private reconnect_subscription_handler: any;

  constructor(private ble: BLE, private storage: Storage, private events: Events, private zone: NgZone) {
    this.checkBluetooth();
    this.storage.ready().then(
        (ready_data) => {
            this.storage.get(this.STORAGE_KEY).then(
                (data) => {
                    if (data) {
                        this.stored_devices = data;
                        // console.log("MultiBLEProvider::constructor loaded stored devices", data);
                        for (var device_id of Object.keys(this.stored_devices)) {
                            if (this.stored_devices[device_id].stored) {
                                this.devices[device_id] = this.stored_devices[device_id];
                                this.devices[device_id].connected = false;
                                this.devices[device_id].connecting = false;
                                this.devices[device_id].stored = true;
                            }
                        }
                        this.reconnectAll();
                    }
                },
                (error) => {
                // console.log("MultiBLEProvider::constructor could not retrieve stored devices", error);
                }
            );
        }
    );
  }

  disconnectAll() {
    for (var device_id of Object.keys(this.devices)) {
        if (this.devices[device_id].connected) {
            this.disconnect(device_id);
        }
    }
  }

  forgetAll() {
    this.disconnectAll();
    for (var device_id of Object.keys(this.devices)) {
        this.devices[device_id].stored = false;
    }
    this.stored_devices = { };
    this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
        (data) => {
        // console.log("MultiBLEProvider::forgetAll success", data);
            this.storage.get(this.STORAGE_KEY).then(
                (data) => { 
                // console.log("MultiBLEProvider::forgetAll storage is now", data); 
                }
            );
        },
        (error) => {
        // console.log("MultiBLEProvider::forgetAll failure", error);
        }
    );
    
  }

  reconnectAll() {
    if (this.isEnabled && !this.reconnecting && Object.keys(this.stored_devices).length > 0) {
    // console.log("MultiBLEProvider::reconnectAll initiating reconnect for stored_devices", Object.keys(this.stored_devices));
        this.reconnecting = true;
        this.reconnect_subscription_handler = (event) => {
        // console.log("MultiBLEProvider::reconnectAll::reconnect_subscription_handler", event);
            if (this.reconnect_devices[event.device_id]) {
                delete this.reconnect_devices[event.device_id];
            }
            if (Object.keys(this.reconnect_devices).length <= 0 ) {
                this.reconnecting = false;
                this.events.unsubscribe(this.TOPIC, this.reconnect_subscription_handler);
                // console.log("MultiBLEProvider::reconnectAll::reconnect_subscription_handler reconnect finished");
            }
        };
        this.events.subscribe(this.TOPIC, this.reconnect_subscription_handler);
        this.reconnect_devices = this.stored_devices;
        for (var device_id of Object.keys(this.reconnect_devices)) {
            if (!this.devices[device_id].connected && !this.devices[device_id].connecting) {
            // console.log("MultiBLEProvider::reconnectAll attempting", this.devices[device_id]);
                this.connect(device_id);
            } else {
            // console.log("MultiBLEProvider::reconnectAll skipping", this.devices[device_id]);
            }
        }    
    } else {
    // console.log("MultiBLEProvider::reconnectAll already in progress");
    }
  }

  checkBluetooth() {
    this.ble.isEnabled().then(
        (data) => {
        // console.log("MultiBLEProvider::constructor bluetooth enabled");
            this.isEnabled = true;
            this.reconnectAll();
        },
        (error) => {
        // console.log("MultiBLEProvider::constructor bluetooth disabled");
            this.isEnabled = false;
            for (var device_id of Object.keys(this.devices)) {
                this.devices[device_id].connected = false;
                this.devices[device_id].connecting = false;
            }
        }
    );
  }

  enableBluetooth() {
    this.ble.enable().then(
        (data) => {
            this.checkBluetooth();
        },
        (error) => {
            this.checkBluetooth();
        }
    );
  }

  saveDevice(device_id: string) {
    this.devices[device_id].stored = true;
    this.stored_devices = { };
    for (var device_id of Object.keys(this.devices)) {
        if (this.devices[device_id].stored) {
            this.stored_devices[device_id] = this.devices[device_id];
        }
    }
    this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
        (data) => {
        // console.log("MultiBLEProvider::saveDevice success", this.stored_devices);
        },
        (error) => {
        // console.log("MultiBLEProvider::saveDevice error", error);
        }
    );
  }

  forgetDevice(device_id: string) {
    if (this.devices[device_id]) {
        this.devices[device_id].stored = false;
    }
    if (this.stored_devices[device_id]) {
        delete this.stored_devices[device_id];
        this.storage.set(this.STORAGE_KEY, this.stored_devices).then(
            (data) => {
            // console.log("MultiBLEProvider::forgetDevice success", data);
            },
            (error) => {
            // console.log("MultiBLEProvider::forgetDevice error", error);
            }
        );
    }
  }

  // ASCII only
  stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  stopScan() {
    this.ble.stopScan().then(
        (data) => {
            this.scanning = false;
            this.device_ids = Object.keys(this.devices);
            // console.log("MultiBLEProvider::stopScan");
        }
    );
  }

  startScan(services: string[] = []) {
    this.scanning = true;
    this.ble.startScan(services).subscribe(
        (data) => {
            this.zone.run(
                () => {
                    var device_id = data.id;
                    if (this.devices[device_id]) {
                        for (var key of Object.keys(data)) {
                            this.devices[device_id][key] = data[key];
                        }
                        this.device_ids = Object.keys(this.devices);
                        //console.log("MultiBLEProvider::startScan refreshing device", this.devices[device_id]);
                        this.events.publish(this.TOPIC, new MultiBLEEvent("found", device_id, this.devices[device_id]));
                    } else {
                        var device = new BLEDeviceInfo();
                        for (var key of Object.keys(data)) {
                            device[key] = data[key];
                        }
                        this.devices[device_id] = device;
                        this.device_ids = Object.keys(this.devices);
                        //console.log("MultiBLEProvider::startScan found new device", this.devices[device_id]);
                        this.events.publish(this.TOPIC, new MultiBLEEvent("discovered", device_id, data));
                    }

                    if (this.devices[device_id].stored && !this.devices[device_id].connected) {
                    //console.log("MultiBLEProvider::startScan reconnecting to stored device", device_id);
                        this.connect(device_id);
                        this.events.publish(this.TOPIC, new MultiBLEEvent("reconnecting", device_id, this.devices[device_id]));
                        this.device_ids = Object.keys(this.devices);
                    }
                }
            );
        },
        (error) => {
        // console.log("MultiBLE::startScan error: ", error);
        },
        () => {
        // console.log("MultiBLE::startScan finished");
            this.scanning = false;
        }
    );
    setTimeout(
        () => {
            this.stopScan();
        },
        10000
    );
  }

  disconnect(device_id: string) {
  //console.log("MultiBLEProvider::disconnect", device_id);
    this.ble.disconnect(device_id).then(
        (data) => {
            this.zone.run(
                () => {
                    this.devices[device_id].connected = false;
                    this.forgetDevice(device_id);
                    this.device_ids = Object.keys(this.devices);
                    this.events.publish(this.TOPIC, new MultiBLEEvent("disconnected", device_id, this.devices[device_id]));
                }
            );
        },
        (error) => {
        }
    );
  }

  connect(device_id: string) {
  // console.log("MultiBLEProvider::connect initiating", device_id);
    this.devices[device_id].connecting = true;
    this.device_ids = Object.keys(this.devices);
    this.events.publish(this.TOPIC, new MultiBLEEvent("connecting", device_id, this.devices[device_id]));
    this.ble.connect(device_id).subscribe( 
        (data) => {
            this.zone.run(
                () => {
                //console.log("MultiBLEProvider::connect success", data);
                    this.saveDevice(device_id);
                    this.devices[device_id].connected = true; 
                    this.devices[device_id].connecting = false;
                    for (var key of Object.keys(data)) {
                        this.devices[device_id][key] = data[key];
                    }
                    this.device_ids = Object.keys(this.devices);
                    this.events.publish(this.TOPIC, new MultiBLEEvent("connected", device_id, this.devices[device_id]));
                }
            );
        },
        (error) => {
            this.zone.run(
                () => {
                //console.log("MultiBLEProvider::connect error", error);
                    this.devices[device_id].connected = false; 
                    this.devices[device_id].connecting = false;
                    this.device_ids = Object.keys(this.devices);
                    this.events.publish(this.TOPIC, new MultiBLEEvent("error", device_id, this.devices[device_id]));
                }
            );
        },
        () => {
            this.zone.run(
                () => {
                //console.log("MultiBLEProvider::connect finished for device", device_id);
                    this.devices[device_id].connected = false;
                    this.devices[device_id].connecting = false;
                    this.device_ids = Object.keys(this.devices);
                }
            );
        }
    );
  }
}
