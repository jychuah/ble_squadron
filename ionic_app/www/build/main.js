webpackJsonp([0],{

/***/ 101:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SmartAudioProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_native_audio__ = __webpack_require__(199);
// Code from Josh Morony
// https://www.joshmorony.com/sound-effects-using-html5-and-native-audio-in-ionic/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var SmartAudioProvider = (function () {
    function SmartAudioProvider(nativeAudio, platform) {
        this.nativeAudio = nativeAudio;
        this.audioType = 'html5';
        this.sounds = [];
        if (platform.is('cordova')) {
            this.audioType = 'native';
        }
    }
    SmartAudioProvider.prototype.preload = function (key, asset) {
        if (this.audioType === 'html5') {
            var audio = {
                key: key,
                asset: asset,
                type: 'html5'
            };
            this.sounds.push(audio);
        }
        else {
            this.nativeAudio.preloadSimple(key, asset);
            var audio = {
                key: key,
                asset: key,
                type: 'native'
            };
            this.sounds.push(audio);
        }
    };
    SmartAudioProvider.prototype.play = function (key) {
        var audio = this.sounds.find(function (sound) {
            return sound.key === key;
        });
        if (audio.type === 'html5') {
            var audioAsset = new Audio(audio.asset);
            audioAsset.play();
        }
        else {
            this.nativeAudio.play(audio.asset).then(function (res) {
                console.log(res);
            }, function (err) {
                console.log(err);
            });
        }
    };
    SmartAudioProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_2__ionic_native_native_audio__["a" /* NativeAudio */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */]])
    ], SmartAudioProvider);
    return SmartAudioProvider;
}());

//# sourceMappingURL=smart-audio.js.map

/***/ }),

/***/ 102:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export MultiBLEEvent */
/* unused harmony export BLEDeviceInfo */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MultiBLEProvider; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ionic_native_ble__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_storage__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_ionic_angular__ = __webpack_require__(27);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var MultiBLEEvent = (function () {
    function MultiBLEEvent(event, device_id, device) {
        this.event = event;
        this.device_id = device_id;
        this.device = device;
    }
    return MultiBLEEvent;
}());

var BLEDeviceInfo = (function () {
    function BLEDeviceInfo() {
        this.connected = false;
        this.connecting = false;
        this.stored = false;
    }
    return BLEDeviceInfo;
}());

/*
  Generated class for the MultiBLEProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
var MultiBLEProvider = (function () {
    function MultiBLEProvider(ble, storage, events, zone) {
        var _this = this;
        this.ble = ble;
        this.storage = storage;
        this.events = events;
        this.zone = zone;
        this.devices = {};
        this.device_ids = [];
        this.stored_devices = {};
        this.scanning = false;
        this.isEnabled = false;
        this.reconnecting = false;
        this.STORAGE_KEY = "multible_devices";
        this.TOPIC = "multible";
        this.reconnect_devices = {};
        this.checkBluetooth();
        this.storage.ready().then(function (ready_data) {
            _this.storage.get(_this.STORAGE_KEY).then(function (data) {
                if (data) {
                    _this.stored_devices = data;
                    // console.log("MultiBLEProvider::constructor loaded stored devices", data);
                    for (var _i = 0, _a = Object.keys(_this.stored_devices); _i < _a.length; _i++) {
                        var device_id = _a[_i];
                        if (_this.stored_devices[device_id].stored) {
                            _this.devices[device_id] = _this.stored_devices[device_id];
                            _this.devices[device_id].connected = false;
                            _this.devices[device_id].connecting = false;
                            _this.devices[device_id].stored = true;
                        }
                    }
                    _this.reconnectAll();
                }
            }, function (error) {
                // console.log("MultiBLEProvider::constructor could not retrieve stored devices", error);
            });
        });
    }
    MultiBLEProvider.prototype.disconnectAll = function () {
        for (var _i = 0, _a = Object.keys(this.devices); _i < _a.length; _i++) {
            var device_id = _a[_i];
            if (this.devices[device_id].connected) {
                this.disconnect(device_id);
            }
        }
    };
    MultiBLEProvider.prototype.forgetAll = function () {
        var _this = this;
        this.disconnectAll();
        for (var _i = 0, _a = Object.keys(this.devices); _i < _a.length; _i++) {
            var device_id = _a[_i];
            this.devices[device_id].stored = false;
        }
        this.stored_devices = {};
        this.storage.set(this.STORAGE_KEY, this.stored_devices).then(function (data) {
            // console.log("MultiBLEProvider::forgetAll success", data);
            _this.storage.get(_this.STORAGE_KEY).then(function (data) {
                // console.log("MultiBLEProvider::forgetAll storage is now", data); 
            });
        }, function (error) {
            // console.log("MultiBLEProvider::forgetAll failure", error);
        });
    };
    MultiBLEProvider.prototype.reconnectAll = function () {
        var _this = this;
        if (this.isEnabled && !this.reconnecting && Object.keys(this.stored_devices).length > 0) {
            // console.log("MultiBLEProvider::reconnectAll initiating reconnect for stored_devices", Object.keys(this.stored_devices));
            this.reconnecting = true;
            this.reconnect_subscription_handler = function (event) {
                // console.log("MultiBLEProvider::reconnectAll::reconnect_subscription_handler", event);
                if (_this.reconnect_devices[event.device_id]) {
                    delete _this.reconnect_devices[event.device_id];
                }
                if (Object.keys(_this.reconnect_devices).length <= 0) {
                    _this.reconnecting = false;
                    _this.events.unsubscribe(_this.TOPIC, _this.reconnect_subscription_handler);
                    // console.log("MultiBLEProvider::reconnectAll::reconnect_subscription_handler reconnect finished");
                }
            };
            this.events.subscribe(this.TOPIC, this.reconnect_subscription_handler);
            this.reconnect_devices = this.stored_devices;
            for (var _i = 0, _a = Object.keys(this.reconnect_devices); _i < _a.length; _i++) {
                var device_id = _a[_i];
                if (!this.devices[device_id].connected && !this.devices[device_id].connecting) {
                    // console.log("MultiBLEProvider::reconnectAll attempting", this.devices[device_id]);
                    this.connect(device_id);
                }
                else {
                    // console.log("MultiBLEProvider::reconnectAll skipping", this.devices[device_id]);
                }
            }
        }
        else {
            // console.log("MultiBLEProvider::reconnectAll already in progress");
        }
    };
    MultiBLEProvider.prototype.checkBluetooth = function () {
        var _this = this;
        this.ble.isEnabled().then(function (data) {
            // console.log("MultiBLEProvider::constructor bluetooth enabled");
            _this.isEnabled = true;
            _this.reconnectAll();
        }, function (error) {
            // console.log("MultiBLEProvider::constructor bluetooth disabled");
            _this.isEnabled = false;
            for (var _i = 0, _a = Object.keys(_this.devices); _i < _a.length; _i++) {
                var device_id = _a[_i];
                _this.devices[device_id].connected = false;
                _this.devices[device_id].connecting = false;
            }
        });
    };
    MultiBLEProvider.prototype.enableBluetooth = function () {
        var _this = this;
        this.ble.enable().then(function (data) {
            _this.checkBluetooth();
        }, function (error) {
            _this.checkBluetooth();
        });
    };
    MultiBLEProvider.prototype.saveDevice = function (device_id) {
        this.devices[device_id].stored = true;
        this.stored_devices = {};
        for (var _i = 0, _a = Object.keys(this.devices); _i < _a.length; _i++) {
            var device_id = _a[_i];
            if (this.devices[device_id].stored) {
                this.stored_devices[device_id] = this.devices[device_id];
            }
        }
        this.storage.set(this.STORAGE_KEY, this.stored_devices).then(function (data) {
            // console.log("MultiBLEProvider::saveDevice success", this.stored_devices);
        }, function (error) {
            // console.log("MultiBLEProvider::saveDevice error", error);
        });
    };
    MultiBLEProvider.prototype.forgetDevice = function (device_id) {
        if (this.devices[device_id]) {
            this.devices[device_id].stored = false;
        }
        if (this.stored_devices[device_id]) {
            delete this.stored_devices[device_id];
            this.storage.set(this.STORAGE_KEY, this.stored_devices).then(function (data) {
                // console.log("MultiBLEProvider::forgetDevice success", data);
            }, function (error) {
                // console.log("MultiBLEProvider::forgetDevice error", error);
            });
        }
    };
    // ASCII only
    MultiBLEProvider.prototype.stringToBytes = function (string) {
        var array = new Uint8Array(string.length);
        for (var i = 0, l = string.length; i < l; i++) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    };
    // ASCII only
    MultiBLEProvider.prototype.bytesToString = function (buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    };
    MultiBLEProvider.prototype.stopScan = function () {
        var _this = this;
        this.ble.stopScan().then(function (data) {
            _this.scanning = false;
            _this.device_ids = Object.keys(_this.devices);
            // console.log("MultiBLEProvider::stopScan");
        }, function (error) { });
    };
    MultiBLEProvider.prototype.startScan = function (services) {
        var _this = this;
        if (services === void 0) { services = []; }
        this.scanning = true;
        this.ble.startScan(services).subscribe(function (data) {
            _this.zone.run(function () {
                var device_id = data.id;
                if (_this.devices[device_id]) {
                    for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                        var key = _a[_i];
                        _this.devices[device_id][key] = data[key];
                    }
                    _this.device_ids = Object.keys(_this.devices);
                    //console.log("MultiBLEProvider::startScan refreshing device", this.devices[device_id]);
                    _this.events.publish(_this.TOPIC, new MultiBLEEvent("found", device_id, _this.devices[device_id]));
                }
                else {
                    var device = new BLEDeviceInfo();
                    for (var _b = 0, _c = Object.keys(data); _b < _c.length; _b++) {
                        var key = _c[_b];
                        device[key] = data[key];
                    }
                    _this.devices[device_id] = device;
                    _this.device_ids = Object.keys(_this.devices);
                    //console.log("MultiBLEProvider::startScan found new device", this.devices[device_id]);
                    _this.events.publish(_this.TOPIC, new MultiBLEEvent("discovered", device_id, data));
                }
                if (_this.devices[device_id].stored && !_this.devices[device_id].connected) {
                    //console.log("MultiBLEProvider::startScan reconnecting to stored device", device_id);
                    _this.connect(device_id);
                    _this.events.publish(_this.TOPIC, new MultiBLEEvent("reconnecting", device_id, _this.devices[device_id]));
                    _this.device_ids = Object.keys(_this.devices);
                }
            });
        }, function (error) {
            // console.log("MultiBLE::startScan error: ", error);
        }, function () {
            // console.log("MultiBLE::startScan finished");
            _this.scanning = false;
        });
        setTimeout(function () {
            _this.stopScan();
        }, 10000);
    };
    MultiBLEProvider.prototype.disconnect = function (device_id) {
        var _this = this;
        //console.log("MultiBLEProvider::disconnect", device_id);
        this.ble.disconnect(device_id).then(function (data) {
            _this.zone.run(function () {
                _this.devices[device_id].connected = false;
                _this.forgetDevice(device_id);
                _this.device_ids = Object.keys(_this.devices);
                _this.events.publish(_this.TOPIC, new MultiBLEEvent("disconnected", device_id, _this.devices[device_id]));
            });
        }, function (error) {
        });
    };
    MultiBLEProvider.prototype.connect = function (device_id) {
        var _this = this;
        // console.log("MultiBLEProvider::connect initiating", device_id);
        this.devices[device_id].connecting = true;
        this.device_ids = Object.keys(this.devices);
        this.events.publish(this.TOPIC, new MultiBLEEvent("connecting", device_id, this.devices[device_id]));
        this.ble.connect(device_id).subscribe(function (data) {
            _this.zone.run(function () {
                //console.log("MultiBLEProvider::connect success", data);
                _this.saveDevice(device_id);
                _this.devices[device_id].connected = true;
                _this.devices[device_id].connecting = false;
                for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                    var key = _a[_i];
                    _this.devices[device_id][key] = data[key];
                }
                _this.device_ids = Object.keys(_this.devices);
                _this.events.publish(_this.TOPIC, new MultiBLEEvent("connected", device_id, _this.devices[device_id]));
            });
        }, function (error) {
            _this.zone.run(function () {
                //console.log("MultiBLEProvider::connect error", error);
                _this.devices[device_id].connected = false;
                _this.devices[device_id].connecting = false;
                _this.device_ids = Object.keys(_this.devices);
                _this.events.publish(_this.TOPIC, new MultiBLEEvent("error", device_id, _this.devices[device_id]));
            });
        }, function () {
            _this.zone.run(function () {
                //console.log("MultiBLEProvider::connect finished for device", device_id);
                _this.devices[device_id].connected = false;
                _this.devices[device_id].connecting = false;
                _this.device_ids = Object.keys(_this.devices);
            });
        });
    };
    MultiBLEProvider = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["A" /* Injectable */])(),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__ionic_native_ble__["a" /* BLE */], __WEBPACK_IMPORTED_MODULE_2__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_3_ionic_angular__["a" /* Events */], __WEBPACK_IMPORTED_MODULE_0__angular_core__["M" /* NgZone */]])
    ], MultiBLEProvider);
    return MultiBLEProvider;
}());

//# sourceMappingURL=multible.js.map

/***/ }),

/***/ 115:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 115;

/***/ }),

/***/ 156:
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = 156;

/***/ }),

/***/ 200:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return HomePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(27);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var HomePage = (function () {
    function HomePage(navCtrl) {
        this.navCtrl = navCtrl;
    }
    HomePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-home',template:/*ion-inline-start:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/pages/home/home.html"*/'<ion-header>\n  <ion-navbar>\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>BLuE Squadron</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding>\n    <h5>Device Status</h5>\n    <blelist [disableSelect]="true"></blelist>\n</ion-content>\n'/*ion-inline-end:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/pages/home/home.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */]])
    ], HomePage);
    return HomePage;
}());

//# sourceMappingURL=home.js.map

/***/ }),

/***/ 201:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DevicePage; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_blelist_blelist__ = __webpack_require__(202);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__providers_multible_multible__ = __webpack_require__(102);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ionic_native_ble__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ionic_storage__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__providers_smart_audio_smart_audio__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__angular_platform_browser__ = __webpack_require__(21);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var DevicePage = (function () {
    function DevicePage(navCtrl, storage, events, multible, navParams, ble, smartAudio, dom) {
        var _this = this;
        this.navCtrl = navCtrl;
        this.storage = storage;
        this.events = events;
        this.multible = multible;
        this.navParams = navParams;
        this.ble = ble;
        this.smartAudio = smartAudio;
        this.dom = dom;
        this.showlist = true;
        this.storage_key = "";
        this.name = "";
        this.deviceDisplayName = "";
        this.device_id = "";
        this.uart_service_id = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
        this.uart_service_rx_id = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
        this.services = [this.uart_service_id]; // UART Serial service
        this.config = {};
        this.events.subscribe(this.multible.TOPIC, function (event) {
            if (_this.blelist && event.device_id == _this.device_id) {
                if (event.event == "connected") {
                    _this.storage.set(_this.storage_key, _this.blelist.selectedDevice);
                    setTimeout(function () { _this.blelist.setVisibility(false); }, 1000);
                }
                if (event.event == "error" || event.event == "disconnected") {
                    _this.blelist.setVisibility(true);
                }
            }
        });
    }
    DevicePage.prototype.send = function (message) {
        var device = this.multible.devices[this.device_id];
        if (device && device.connected) {
            this.ble.write(this.device_id, this.uart_service_id, this.uart_service_rx_id, this.multible.stringToBytes(message)).then(function (data) {
                console.log("Write successful", data);
            }, function (error) {
                console.log("Write error", error);
            });
        }
    };
    DevicePage.prototype.runEffect = function (effect) {
        this.send("effect " + effect.name);
        this.smartAudio.play(effect.audio);
    };
    DevicePage.prototype.controlSlider = function (control) {
        this.send(control.name + " " + control.value);
    };
    DevicePage.prototype.deviceSelected = function (device_id) {
        this.device_id = device_id;
    };
    DevicePage.prototype.switchDevice = function () {
        this.multible.disconnect(this.device_id);
        this.blelist.selectedDevice = "";
    };
    DevicePage.prototype.ionViewDidEnter = function () {
        var _this = this;
        this.config = this.navParams.get('config');
        this.name = this.config.name;
        this.background = this.dom.bypassSecurityTrustStyle("url('" + this.config.background + "')");
        // this.background = this.config.background;
        if (this.name && this.name.length) {
            this.storage_key = "device" + this.name;
            this.storage.get(this.storage_key).then(function (data) {
                _this.device_id = data;
                _this.blelist.selectedDevice = _this.device_id;
                if (_this.multible.devices[_this.device_id]) {
                    _this.deviceDisplayName = _this.multible.devices[_this.device_id].name ? _this.multible.devices[_this.device_id].name : data;
                }
                if (_this.multible.devices[_this.device_id] && _this.multible.devices[_this.device_id].connected) {
                    _this.blelist.setVisibility(false);
                }
            });
        }
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])('blelist'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_2__components_blelist_blelist__["a" /* BLEListComponent */])
    ], DevicePage.prototype, "blelist", void 0);
    DevicePage = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'page-device',template:/*ion-inline-start:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/pages/device/device.html"*/'<ion-header>\n  <ion-navbar>\n    <button ion-button menuToggle>\n      <ion-icon name="menu"></ion-icon>\n    </button>\n    <ion-title>{{name}}</ion-title>\n  </ion-navbar>\n</ion-header>\n\n<ion-content padding *ngIf="config" [style.background-image]="background"> \n    <ion-list *ngIf="config.effects">\n        <ion-list-header class="device_item">Effects</ion-list-header>\n        <button class="device_item device_item-button" ion-item *ngFor="let effect of config.effects" (click)="runEffect(effect)">\n            <h3>{{ effect.desc }}</h3>\n            <p>{{ effect.subtitle }}</p>\n        </button>\n    </ion-list>\n    <ion-list *ngIf="config.controls">\n        <ion-list-header class="device_item">Controls</ion-list-header>\n        <ion-item class="device_item" *ngFor="let control of config.controls" class="device_item">\n            <ion-label><h3>{{ control.desc }}</h3></ion-label>\n            <ion-range class="device_item-button" [min]="control.min" [max]="control.max" [(ngModel)]="control.value" step="1" (ionChange)="controlSlider(control)">\n                <ion-icon small range-left name="sunny"></ion-icon>\n                <ion-icon range-right name="sunny"></ion-icon>\n            </ion-range>\n        </ion-item>\n    </ion-list>\n</ion-content>\n\n<ion-footer>\n    <ion-toolbar *ngIf="blelist && blelist.visibleState != \'visible\'">\n        <span *ngIf="blelist">{{ deviceDisplayName }}</span>\n        <ion-buttons end>\n            <button ion-button (click)="switchDevice()">Switch device</button>\n        </ion-buttons>\n    </ion-toolbar>\n    <blelist #blelist *ngIf="showlist" (deviceSelected)="deviceSelected($event)" [services]="services"></blelist>\n</ion-footer>\n'/*ion-inline-end:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/pages/device/device.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["f" /* NavController */], __WEBPACK_IMPORTED_MODULE_5__ionic_storage__["b" /* Storage */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["a" /* Events */],
            __WEBPACK_IMPORTED_MODULE_3__providers_multible_multible__["a" /* MultiBLEProvider */], __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["g" /* NavParams */], __WEBPACK_IMPORTED_MODULE_4__ionic_native_ble__["a" /* BLE */],
            __WEBPACK_IMPORTED_MODULE_6__providers_smart_audio_smart_audio__["a" /* SmartAudioProvider */], __WEBPACK_IMPORTED_MODULE_7__angular_platform_browser__["c" /* DomSanitizer */]])
    ], DevicePage);
    return DevicePage;
}());

//# sourceMappingURL=device.js.map

/***/ }),

/***/ 202:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BLEListComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__providers_multible_multible__ = __webpack_require__(102);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_animations__ = __webpack_require__(105);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




/**
 * Generated class for the BlelistComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
var BLEListComponent = (function () {
    function BLEListComponent(multible, events) {
        this.multible = multible;
        this.events = events;
        this.inputDevice = "";
        this.disableSelect = false;
        this.services = [];
        this.selectEmitter = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* EventEmitter */]();
        this.visibleState = "visible";
        this.selectedDevice = "";
        this.multible.startScan(this.services);
    }
    BLEListComponent.prototype.setVisibility = function (visibility) {
        if (visibility) {
            this.visibleState = "visible";
        }
        else {
            this.visibleState = "invisible";
        }
    };
    BLEListComponent.prototype.selectDevice = function (device_id) {
        this.selectedDevice = device_id;
        this.selectEmitter.emit(this.selectedDevice);
        this.multible.connect(device_id);
    };
    BLEListComponent.prototype.enableBluetooth = function () {
        console.log("BLEListComponent::enableBluetooth");
        this.multible.enableBluetooth();
    };
    BLEListComponent.prototype.stopScanning = function () {
        console.log("BLEListComponent::stopScanning");
        this.multible.stopScan();
    };
    BLEListComponent.prototype.startScanning = function () {
        console.log("BLEListComponent::startScanning");
        this.multible.startScan();
    };
    BLEListComponent.prototype.ngAfterViewInit = function () {
        this.selectedDevice = this.inputDevice;
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["D" /* Input */])('selectedDevice'),
        __metadata("design:type", String)
    ], BLEListComponent.prototype, "inputDevice", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["D" /* Input */])('disableSelect'),
        __metadata("design:type", Boolean)
    ], BLEListComponent.prototype, "disableSelect", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["D" /* Input */])('services'),
        __metadata("design:type", Array)
    ], BLEListComponent.prototype, "services", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["O" /* Output */])('deviceSelected'),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* EventEmitter */])
    ], BLEListComponent.prototype, "selectEmitter", void 0);
    BLEListComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({
            selector: 'blelist',template:/*ion-inline-start:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/components/blelist/blelist.html"*/'<!-- Generated template for the BlelistComponent component -->\n<div [@visibility]="visibleState">\n    <ion-list no-lines>\n        <ion-list-header>Bluetooth Devices</ion-list-header>\n        <button ion-item *ngFor="let device_id of multible.device_ids" (click)="selectDevice(device_id)" [disabled]="!multible.isEnabled || disableSelect">\n            <ion-icon item-end *ngIf="multible.devices[device_id].id == selectedDevice && multible.devices[device_id].connected" name="checkmark-circle"></ion-icon>\n            <ion-icon item-end *ngIf="multible.devices[device_id].id == selectedDevice && !multible.devices[device_id].connected && !multible.devices[device_id].connecting" name="alert"></ion-icon>\n            <ion-icon item-end *ngIf="multible.devices[device_id].id != selectedDevice && multible.devices[device_id].connected" name="checkmark"></ion-icon>\n            <ion-icon item-end *ngIf="multible.devices[device_id].id != selectedDevice && !multible.devices[device_id].connected && multible.devices[device_id].stored && !multible.devices[device_id].connecting" name="">!</ion-icon>\n            <ion-spinner item-end *ngIf="multible.devices[device_id].connecting" name="bubbles"></ion-spinner>\n            {{ multible.devices[device_id].name ? multible.devices[device_id].name : device_id }}\n        </button>\n        <button ion-button full *ngIf="!multible.isEnabled" (click)="enableBluetooth()">Enable Bluetooth</button>\n        <button ion-button full *ngIf="multible.isEnabled && multible.scanning" (click)="stopScanning()">Stop Scanning&nbsp;&nbsp;&nbsp; <ion-spinner name="bubbles"></ion-spinner></button>\n        <button ion-button full *ngIf="multible.isEnabled && !multible.scanning" (click)="startScanning()">Start Scanning</button>\n    </ion-list>\n</div>\n'/*ion-inline-end:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/components/blelist/blelist.html"*/,
            animations: [
                Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["j" /* trigger */])('visibility', [
                    Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["g" /* state */])('visible', Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["h" /* style */])({
                        height: '*',
                        opacity: 1,
                    })),
                    Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["g" /* state */])('invisible', Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["h" /* style */])({
                        height: '0px',
                        opacity: 0,
                    })),
                    Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["i" /* transition */])('* => *', Object(__WEBPACK_IMPORTED_MODULE_3__angular_animations__["e" /* animate */])('.5s'))
                ])
            ]
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1__providers_multible_multible__["a" /* MultiBLEProvider */], __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["a" /* Events */]])
    ], BLEListComponent);
    return BLEListComponent;
}());

//# sourceMappingURL=blelist.js.map

/***/ }),

/***/ 203:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__ = __webpack_require__(204);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_web_animations_js_web_animations_min__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_web_animations_js_web_animations_min___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_web_animations_js_web_animations_min__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_module__ = __webpack_require__(228);



Object(__WEBPACK_IMPORTED_MODULE_0__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 228:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_ionic_angular__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__app_component__ = __webpack_require__(271);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__pages_home_home__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_device_device__ = __webpack_require__(201);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ionic_native_status_bar__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__ionic_native_splash_screen__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__ionic_native_ble__ = __webpack_require__(103);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__ionic_storage__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__providers_multible_multible__ = __webpack_require__(102);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__components_blelist_blelist__ = __webpack_require__(202);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__map_to_iterable_pipe_map_to_iterable_pipe__ = __webpack_require__(283);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__angular_platform_browser_animations__ = __webpack_require__(284);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__providers_smart_audio_smart_audio__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__ionic_native_native_audio__ = __webpack_require__(199);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
















var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["I" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_device_device__["a" /* DevicePage */],
                __WEBPACK_IMPORTED_MODULE_11__components_blelist_blelist__["a" /* BLEListComponent */],
                __WEBPACK_IMPORTED_MODULE_12__map_to_iterable_pipe_map_to_iterable_pipe__["a" /* MapToIterable */],
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_13__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
                __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["d" /* IonicModule */].forRoot(__WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */], {}, {
                    links: []
                }),
                __WEBPACK_IMPORTED_MODULE_9__ionic_storage__["a" /* IonicStorageModule */].forRoot()
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_2_ionic_angular__["b" /* IonicApp */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_3__app_component__["a" /* MyApp */],
                __WEBPACK_IMPORTED_MODULE_4__pages_home_home__["a" /* HomePage */],
                __WEBPACK_IMPORTED_MODULE_5__pages_device_device__["a" /* DevicePage */],
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_6__ionic_native_status_bar__["a" /* StatusBar */],
                __WEBPACK_IMPORTED_MODULE_7__ionic_native_splash_screen__["a" /* SplashScreen */],
                { provide: __WEBPACK_IMPORTED_MODULE_1__angular_core__["u" /* ErrorHandler */], useClass: __WEBPACK_IMPORTED_MODULE_2_ionic_angular__["c" /* IonicErrorHandler */] },
                __WEBPACK_IMPORTED_MODULE_8__ionic_native_ble__["a" /* BLE */],
                __WEBPACK_IMPORTED_MODULE_10__providers_multible_multible__["a" /* MultiBLEProvider */],
                __WEBPACK_IMPORTED_MODULE_14__providers_smart_audio_smart_audio__["a" /* SmartAudioProvider */],
                __WEBPACK_IMPORTED_MODULE_15__ionic_native_native_audio__["a" /* NativeAudio */],
            ]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 271:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MyApp; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_ionic_angular__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__ = __webpack_require__(196);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__ = __webpack_require__(198);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__providers_smart_audio_smart_audio__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__pages_home_home__ = __webpack_require__(200);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__pages_device_device__ = __webpack_require__(201);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var MyApp = (function () {
    function MyApp(platform, statusBar, splashScreen, smartAudio) {
        this.platform = platform;
        this.statusBar = statusBar;
        this.splashScreen = splashScreen;
        this.smartAudio = smartAudio;
        this.rootPage = __WEBPACK_IMPORTED_MODULE_5__pages_home_home__["a" /* HomePage */];
        this.initializeApp();
        this.audioclips = [
            { "name": "siren", "asset": "assets/audio/raider/T02.wav" },
            { "name": "turbolaser", "asset": "assets/audio/raider/T03.wav" },
            { "name": "enginewash", "asset": "assets/audio/raider/T04.wav" },
            { "name": "pewpew", "asset": "assets/audio/raider/T05.wav" },
            { "name": "march", "asset": "assets/audio/raider/T06.wav" },
            { "name": "blaster", "asset": "assets/audio/falcon/blaster.wav" },
            { "name": "hyperdrive", "asset": "assets/audio/falcon/hyperdrive.wav" },
            { "name": "launch", "asset": "assets/audio/falcon/launch.wav" },
            { "name": "notmyfault", "asset": "assets/audio/falcon/notmyfault.wav" },
            { "name": "watchwhat", "asset": "assets/audio/falcon/watchwhat.wav" },
            { "name": "tantivelaunch", "asset": "assets/audio/tantive/launch.wav" },
            { "name": "alarm", "asset": "assets/audio/tantive/alarm.wav" },
            { "name": "pursuit", "asset": "assets/audio/tantive/pursuit.wav" },
        ];
        // used for an example of ngFor and navigation
        this.devices = [
            {
                name: "Imperial Raider",
                effects: [
                    { "name": "firestern", "desc": "Forward Firing Arc", "subtitle": "Concentrate forward firepower!", "audio": "turbolaser" },
                    { "name": "fireport", "desc": "Left Firing Arc", "subtitle": "Port turbolasers!", "audio": "turbolaser" },
                    { "name": "firestar", "desc": "Right Firing Arc", "subtitle": "Starboard turbolasers!", "audio": "turbolaser" },
                    { "name": "wash", "desc": "Engine Spinup", "subtitle": "Ahead full!", "audio": "enginewash" },
                    { "name": "pewpew", "desc": "Pew pew!", "subtitle": "Lazers...", "audio": "pewpew" },
                    { "name": "march", "desc": "Imperial March!", "subtitle": "Duhh Duhh Duhhhhh...", "audio": "march" }
                ],
                controls: [
                    { "name": "glow", "desc": "Engine Glow", "min": 0, "max": 100, "value": 30 },
                    { "name": "flicker", "desc": "Engine Flicker", "min": 0, "max": 30, "value": 15 },
                    { "name": "spotlight", "desc": "Spotlight", "min": 0, "max": 100, "value": 60 },
                ],
                background: "./assets/imgs/raider.png"
            },
            {
                name: "Millenium Falcon",
                effects: [
                    { "name": "blaster", "desc": "Turret", "subtitle": "powpowpowpowpowww!!!", "audio": "blaster" },
                    { "name": "hyperdrive", "desc": "Hyperdrive", "subtitle": "Punch it!", "audio": "hyperdrive" },
                    { "name": "launch", "desc": "Launch", "subtitle": "This piece of junk?", "audio": "launch" },
                    { "name": "notmyfault", "desc": "Lando", "subtitle": "It's not my fault!", "audio": "notmyfault" },
                    { "name": "watchwhat", "desc": "Leia", "subtitle": "Watch what?", "audio": "watchwhat" }
                ],
                controls: [
                    { "name": "glow", "desc": "Engine Glow", "min": 0, "max": 100, "value": 80 },
                    { "name": "pulse", "desc": "Engine Pulse", "min": 0, "max": 40, "value": 20 },
                    { "name": "rate", "desc": "Pulse Rate", "min": 20, "max": 100, "value": 40 },
                    { "name": "headlights", "desc": "Headlights", "min": 0, "max": 100, "value": 50 },
                ],
                background: "./assets/imgs/falcon.png"
            },
            {
                name: "Tantive IV",
                effects: [
                    { "name": "launch", "desc": "Launch", "subtitle": "LAAAAAAAUNCCCHH!!!!!", "audio": "tantivelaunch" },
                    { "name": "alarm", "desc": "Alarm", "subtitle": "They've shut down the main reactor", "audio": "alarm" },
                    { "name": "pursuit", "desc": "Pursuit", "subtitle": "We're on a diplomatic mission", "audio": "pursuit" }
                ],
                controls: [
                    { "name": "glow", "desc": "Engine Glow", "min": 0, "max": 100, "value": 80 },
                    { "name": "flicker", "desc": "Engine Flicker", "min": 0, "max": 50, "value": 20 },
                ],
                background: "./assets/imgs/tantive.png"
            },
        ];
        for (var _i = 0, _a = this.audioclips; _i < _a.length; _i++) {
            var clip = _a[_i];
            this.smartAudio.preload(clip.name, clip.asset);
        }
    }
    MyApp.prototype.initializeApp = function () {
        var _this = this;
        this.platform.ready().then(function () {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
        });
    };
    MyApp.prototype.openHome = function () {
        this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_5__pages_home_home__["a" /* HomePage */]);
    };
    MyApp.prototype.openDevice = function (device) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        this.nav.setRoot(__WEBPACK_IMPORTED_MODULE_6__pages_device_device__["a" /* DevicePage */], { config: device });
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_8" /* ViewChild */])(__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Nav */]),
        __metadata("design:type", __WEBPACK_IMPORTED_MODULE_1_ionic_angular__["e" /* Nav */])
    ], MyApp.prototype, "nav", void 0);
    MyApp = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["m" /* Component */])({template:/*ion-inline-start:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/app/app.html"*/'<ion-menu [content]="content">\n  <ion-header>\n    <ion-toolbar>\n      <ion-title>Menu</ion-title>\n    </ion-toolbar>\n  </ion-header>\n\n  <ion-content>\n    <ion-list>\n      <button menuClose ion-item (click)="openHome()">Device Status</button>\n      <ion-item-group>\n          <ion-item-divider color="light">Ships</ion-item-divider>\n          <button menuClose ion-item *ngFor="let device of devices" (click)="openDevice(device)">\n            {{ device.name }}\n          </button>\n      </ion-item-group>\n    </ion-list>\n  </ion-content>\n\n</ion-menu>\n\n<!-- Disable swipe-to-go-back because it\'s poor UX to combine STGB with side menus -->\n<ion-nav [root]="rootPage" #content swipeBackEnabled="false"></ion-nav>\n'/*ion-inline-end:"/Users/jchuah/GitHub/ble_squadron/ionic_app/src/app/app.html"*/
        }),
        __metadata("design:paramtypes", [__WEBPACK_IMPORTED_MODULE_1_ionic_angular__["h" /* Platform */], __WEBPACK_IMPORTED_MODULE_2__ionic_native_status_bar__["a" /* StatusBar */], __WEBPACK_IMPORTED_MODULE_3__ionic_native_splash_screen__["a" /* SplashScreen */], __WEBPACK_IMPORTED_MODULE_4__providers_smart_audio_smart_audio__["a" /* SmartAudioProvider */]])
    ], MyApp);
    return MyApp;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 283:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MapToIterable; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(0);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var MapToIterable = (function () {
    function MapToIterable() {
    }
    MapToIterable.prototype.transform = function (dict) {
        var a = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                a.push({ key: key, val: dict[key] });
            }
        }
        return a;
    };
    MapToIterable = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["S" /* Pipe */])({
            name: 'mapToIterable'
        })
    ], MapToIterable);
    return MapToIterable;
}());

//# sourceMappingURL=map-to-iterable-pipe.js.map

/***/ })

},[203]);
//# sourceMappingURL=main.js.map