/*
    Video: https://www.youtube.com/watch?v=oCMOYS71NIU
    Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleNotify.cpp
    Ported to Arduino ESP32 by Evandro Copercini

   Create a BLE server that, once we receive a connection, will send periodic notifications.
   The service advertises itself as: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
   Has a characteristic of: 6E400002-B5A3-F393-E0A9-E50E24DCCA9E - used for receiving data with "WRITE" 
   Has a characteristic of: 6E400003-B5A3-F393-E0A9-E50E24DCCA9E - used to send data with  "NOTIFY"

   The design of creating the BLE server is:
   1. Create a BLE Server
   2. Create a BLE Service
   3. Create a BLE Characteristic on the Service
   4. Create a BLE Descriptor on the characteristic
   5. Start the service.
   6. Start advertising.

   In this example rxValue is the data received (only accessible inside that function).
   And txValue is the data to be sent, in this example just a byte incremented every second. 
*/
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <sstream>
#include <Adafruit_PWMServoDriver.h>



// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

#define     STATUS_LED          7
#define     ENGINE_LEFT_PIN     0
#define     ENGINE_RIGHT_PIN    1
#define     ENGINE_CENTER_PIN   2
#define     STARBOARD_ARC_PIN   8
#define     PORT_ARC_PIN        9
#define     FORWARD_ARC_PIN     10
#define     SPOTLIGHT_PIN       11
#define     BRIDGE_PIN          7

#define     MAX_DUTY_CYCLE      4095

bool deviceConnected = false;
uint8_t txValue = 0;
BLECharacteristic *pCharacteristic;

class Lights {
  public:
  
    Adafruit_PWMServoDriver ledDriver = Adafruit_PWMServoDriver();
    double engine_glow = 0;
    double engine_flicker = 0;
    double spotlight_intensity = 0;
    int new_glow = 50;
    int new_flicker = 15;
    int new_spotlight = 60;
  
    Lights() {
      ledDriver.begin();
      for (int i = 0; i <= 11; i = i + 1) {
        ledDriver.setPin(i, 0);
      }
    }
  
    void pulse_engines() {
      if (deviceConnected) {
        ledDriver.setPin(BRIDGE_PIN, MAX_DUTY_CYCLE);
      } else {
        ledDriver.setPin(BRIDGE_PIN, 0);
      }
      if (new_glow != -1) {
          if (new_glow > engine_glow) {
              engine_glow++;
          } else if (new_glow < engine_glow) {
              engine_glow--;
          } else if (new_glow == engine_glow) {
              new_glow = -1;
          }
      }
      if (new_flicker != -1) {
          if (new_flicker > engine_flicker) {
              engine_flicker++;
          } else if (new_flicker < engine_flicker) {
              engine_flicker--;
          } else if (new_flicker == engine_flicker) {
              new_flicker = -1;
          }
      }
  
      if (new_spotlight != -1) {
          if (new_spotlight > spotlight_intensity) {
              spotlight_intensity++;
          } else if (new_spotlight < spotlight_intensity) {
              spotlight_intensity--;
          } else if (new_spotlight == spotlight_intensity) {
              new_spotlight = -1;
          }
          ledDriver.setPin(SPOTLIGHT_PIN, (int)(spotlight_intensity / 100.0 * MAX_DUTY_CYCLE));
      }
  
      int engine_value = (engine_glow + random(-engine_flicker, 0) / 100.0 * engine_glow) / 100.0 * MAX_DUTY_CYCLE;
      if (engine_value > MAX_DUTY_CYCLE) {
          engine_value = MAX_DUTY_CYCLE;
      }
      ledDriver.setPin(ENGINE_CENTER_PIN, engine_value);
      ledDriver.setPin(ENGINE_LEFT_PIN, engine_value);
      ledDriver.setPin(ENGINE_RIGHT_PIN, engine_value);
  
      delay(10);
    }
    
    void fire(int pin, int decay_rate) {
      int delayVal = 40;
      for (int i = MAX_DUTY_CYCLE; i >= 0 && delayVal > 0; i = i - decay_rate) {
          if (i < 0) {
              i = 0;
          }
          ledDriver.setPin(pin, i);
          delay(delayVal);
          delayVal = delayVal - 1;
      }
      ledDriver.setPin(pin, 0);
      delay(80);
    }
    
    void fire_all(int decay_rate) {
        int delayVal = 40;
        for (int i = MAX_DUTY_CYCLE; i >= 0 && delayVal > 0; i = i - decay_rate) {
            if (i < 0) {
                i = 0;
            }
            ledDriver.setPin(STARBOARD_ARC_PIN, i);
            ledDriver.setPin(PORT_ARC_PIN, i);
            ledDriver.setPin(FORWARD_ARC_PIN, i);
            delay(delayVal);
            delayVal = delayVal - 1;
        }
        ledDriver.setPin(STARBOARD_ARC_PIN, 0);
        ledDriver.setPin(PORT_ARC_PIN, 0);
        ledDriver.setPin(FORWARD_ARC_PIN, 0);
        delay(80);
    }
    
    void wash() {
        Serial.println("wash");
        ledDriver.setPin(ENGINE_LEFT_PIN, 0);
        ledDriver.setPin(ENGINE_RIGHT_PIN, 0);
        ledDriver.setPin(ENGINE_CENTER_PIN, 0);
        delay(400);
        for (int i = 500; i < MAX_DUTY_CYCLE; i = i + 10) {
            int engine_val = i + random(-600, 0);
            if (engine_val < 0) {
                engine_val = 0;
            }
            ledDriver.setPin(ENGINE_LEFT_PIN, engine_val);
            ledDriver.setPin(ENGINE_CENTER_PIN, engine_val);
            ledDriver.setPin(ENGINE_RIGHT_PIN, engine_val);
            delay(10);
        }
    }
    
    void march() {
        Serial.println("march");
        int SET1 = MAX_DUTY_CYCLE;
        int SET2 = 0;
        for (int i = 0; i < 8; i++) {
            if (SET1 == MAX_DUTY_CYCLE) {
                SET1 = 0;
            } else {
                SET1 = MAX_DUTY_CYCLE;
            }
            if (SET2 == MAX_DUTY_CYCLE) {
                SET2 = 0;
            } else {
                SET2 = MAX_DUTY_CYCLE;
            }
    
            ledDriver.setPin(ENGINE_CENTER_PIN, SET1);
            ledDriver.setPin(STARBOARD_ARC_PIN, SET1);
            ledDriver.setPin(PORT_ARC_PIN, SET1);
            ledDriver.setPin(ENGINE_LEFT_PIN, SET2);
            ledDriver.setPin(ENGINE_RIGHT_PIN, SET2);
            ledDriver.setPin(FORWARD_ARC_PIN, SET2);
            ledDriver.setPin(SPOTLIGHT_PIN, SET2);
            delay(575);
        }
        for (int i = 0; i < 11; i++) {
            ledDriver.setPin(i, 0);
        }
    }
    
    void pewpew() {
        Serial.println("pew pew");
        fire_all(1150);
        fire_all(500);
        fire_all(1150);
        fire_all(100);
    }
    
    void effect(std::string param) {
        if (param.compare("pewpew") == 0) {
            pewpew();
            return;
        }
        if (param.compare("march") == 0) {
            march();
            return;
        }
        if (param.compare("wash") == 0) {
            wash();
            return;
        }
        if (param.compare("firestar") == 0) {
            fire(STARBOARD_ARC_PIN, 425);
            fire(STARBOARD_ARC_PIN, 100);
            return;
        }
        if (param.compare("fireport") == 0) {
            fire(PORT_ARC_PIN, 425);
            fire(PORT_ARC_PIN, 100);
            return;
        }
        if (param.compare("firestern") == 0) {
            fire(FORWARD_ARC_PIN, 425);
            fire(FORWARD_ARC_PIN, 100);
            return;
        }
    }
    
    void glow(std::string param) {
        new_glow = atoi( param.c_str() );
        Serial.print("glow ");
        Serial.printf("%d\n", new_glow);
    }
    
    void flicker(std::string param) {
        new_flicker = atoi(param.c_str() );
        Serial.print("flicker ");
        Serial.printf("%d\n", new_flicker);
    }
    
    void spotlight(std::string param) {
        new_spotlight = atoi(param.c_str() );
        Serial.print("spotlight ");
        Serial.printf("%d\n", new_spotlight);
    }
};

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      Serial.println("Connection initiated");
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      Serial.println("Connection terminated");
      deviceConnected = false;
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
  public:
    Lights *lights;

    MyCallbacks(Lights *lights_) {
      lights = lights_;
    }
    
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();

      if (rxValue.length() > 0) {
        std::vector<std::string> tokens;
        std::string token;
        std::istringstream tokenStream(rxValue);
        while (std::getline(tokenStream, token, ' ')) {
          tokens.push_back(token);
        }
        Serial.print("Received ");
        Serial.println(rxValue.c_str());
        if (tokens.size() >= 2) {
          std::string command = tokens[0];
          std::string param = tokens[1];
          if (command.compare("effect") == 0) {
            lights->effect(param);
          }
          if (command.compare("glow") == 0) {
            lights->glow(param);
          }
          if (command.compare("flicker") == 0) {
            lights->flicker(param);
          }
          if (command.compare("spotlight") == 0) {
            lights->spotlight(param);
          }
        }
      }
    }
};

Lights *lights;

void setup() {
  Serial.begin(115200);
  Serial.println("Imperial Raider Initiated");

  lights = new Lights();

  Serial.println("LED Driver initiated");
  
  // Create the BLE Device
  BLEDevice::init("Imperial Raider");

  // Create the BLE Server
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID_TX,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );
                      
  pCharacteristic->addDescriptor(new BLE2902());

  BLECharacteristic *pCharacteristic = pService->createCharacteristic(
                                         CHARACTERISTIC_UUID_RX,
                                         BLECharacteristic::PROPERTY_WRITE
                                       );

  pCharacteristic->setCallbacks(new MyCallbacks(lights));

  // Start the service
  pService->start();

  // Start advertising
  pServer->getAdvertising()->start();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
  lights->pulse_engines();
}
