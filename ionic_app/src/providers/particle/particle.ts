import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';

/*
  Generated class for the ParticleProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class ParticleProvider {
  public api: any;
  public token: string = null;
  public devices: any = [ ];
  public deviceId: string = null;
  public device: any = null;
  private _events: any;

  constructor(private storage: Storage) {
    var Particle = require('particle-api-js');
    this.api = new Particle();
  }

  setToken(token: string) {
    this.token = token;
    if (!token || !token.length) {
        return new Promise((resolve, reject) => {
            this.storage.ready().then(
                (ready) => {
                    this.storage.remove("token").then(
                        (ready) => { resolve(ready); },
                        (error) => { reject(error); }
                    );
                },
                (error) => {
                    reject(error);
                }
            );
        });
    } else {
        this.storage.set("token", token);
        this.listDevices();
    }
    return new Promise((resolve, reject) => {
        this.api.getUserInfo({ auth: token }).then(
            (data) => {
                resolve(data);
            },
            (error) => {
                reject(error);
            }
        );
    });
  }

  setDevice(deviceId: string) {
    this.deviceId = deviceId;
    if (!deviceId || !deviceId.length) {
        return new Promise((resolve, reject) => {
            this.storage.ready().then(
                (ready) => {
                    this.storage.remove("deviceId").then(
                        (ready) => { resolve(ready); },
                        (error) => { reject(error); }
                    );
                },
                (error) => {
                    reject(error);
                }
            );
        });
    } else {
        this.storage.set("deviceId", deviceId);
    }
    return new Promise((resolve, reject) => {
        this.getDevice(deviceId).then(
            (device) => {
                this.device = device;
                resolve(device);
            },
            (error) => {
                this.device = null;
                reject(error);
            }
        );
    });
  }

  getDevice(deviceId: string = this.deviceId) {
    var promise = new Promise((resolve, reject) => {
        this.api.getDevice({ deviceId: deviceId, auth: this.token }).then(
            (result) => {
                for (var i in this.devices) {
                    if(this.devices[i].id == deviceId){
                        this.devices[i] = result.body;
                        resolve(result.body);
                        return;
                    }

                }
                this.devices.push(result.body);
                resolve(result.body);
            },
            (error) => {
                for (var i in this.devices) {
                    if(this.devices[i].id == deviceId){
                        this.devices.splice(i, 1);
                        reject(error);
                        return;
                    }
                }
                reject(error);
            }
        );
    });
    return promise;
  }

  getConnectionStatus(deviceId: string = this.deviceId) {
  }

  getEventStream(name: string, deviceId: string = this.deviceId) {
    return this.api.getEventStream({ name: name, deviceId: deviceId, auth: this.token });
  }

  subscribe(name: string, deviceId: string = this.deviceId) {
    var observable = Observable.create(
        (observer) => {
            this.getEventStream(name, deviceId).then(
                (stream) => {
                    stream.on('event', (result) => {
                        observer.next(result);
                    });
                    stream.onerror = (error) => { observer.error(error); };
                    return () => {
                        stream.close();
                    };
                },
                (error) => {
                    observer.error(error);
                }
            );
        }
    );
    return observable;
  }

  login(email: string, password: string) {
    if (!(email.length && password.length)) {
        return null;
    }
    var promise = new Promise(
        (resolve, reject) => {
            this.api.login( { username: email, password: password } ).then(
                (data) => {
                    this.setToken(data.body.access_token).then(
                        (userInfo) => {
                            resolve(userInfo);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
                    resolve(data);
                },
                (error) => {
                    this.setToken(null);
                    reject(error);
                }
            );
        }
    );
    return promise;
  }

  logout() {
    this.token = null;
    this.devices = [ ];
    this.deviceId = null;
    this.storage.ready().then(
        (ready) => {
            this.storage.remove("token");
            this.storage.remove("deviceId");
        }
    );
  }

  listDevices() {
    var promise = new Promise( (resolve, reject) => {
        this.api.listDevices({ auth: this.token }).then(
            (data) => {
                if (data["statusCode"] != 200) {
                    reject(data);
                } else {
                    this.devices = data.body;
                    this.api.getEventStream({ deviceId: 'mine', auth: this.token }).then(
                        (stream) => {
                            if (this._events){
                                this._events.end();
                                this._events = null;
                            }
                            this._events = stream;
                            this._events.on('event', (result) => {
                                if (result.name === "spark/status") {
                                    for (var i in this.devices) {
                                        if(this.devices[i] === result.coreid){
                                            this.devices[i].connected = result.data == "online";
                                        }
                                    }
                                    if (this.device.id === result.coreid){
                                        this.device.id.connected = result.data == "online";
                                    }
                                }
                            });
                        },
                        (error) => {
                            console.log("error", error)
                        });
                    resolve(this.devices);
                }
            },
            (error) => {
                reject(error);
            });
    });
    return promise;
  }

  getVariable(variable: string, deviceId : string = this.deviceId) {
    return new Promise((resolve, reject) => {
        this.api.getVariable({ name: variable, auth: this.token, deviceId: deviceId }).then(
            (data) => {
                resolve(data.body.result);
            },
            (error) => {
                reject(error);
            }
        );
    }
    );
  }

  pollVariable(variable: string, interval: number = 2000, deviceId: string = this.deviceId) {
    var source = Observable.interval(interval).flatMap( (i) => {
        return Observable.fromPromise(this.getVariable(variable, deviceId));
    });
    return source;
  }

  callFunction(name: string, argument: any = null, deviceId: string = this.deviceId) {
    return this.api.callFunction({ name: name, auth: this.token, argument: argument, deviceId: deviceId });
  }

  publishEvent(name: string, data: any = null, isPrivate: boolean = true) {
    return this.api.publishEvent({ name: name, data: data, isPrivate: isPrivate, auth: this.token });
  }
}
