
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
#include <Adafruit_TLC59711.h>
#include <SPI.h>



// See the following for generating UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define CHARACTERISTIC_UUID_RX "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"
#define CHARACTERISTIC_UUID_TX "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"

#define     BRIDGE_PIN          16
#define     BRIDGE_GND          17
#define     LEFT_HEADLIGHT      4
#define     RIGHT_HEADLIGHT     11
#define     NUM_ENGINES         12

#define     MAX_DUTY_CYCLE      65535

bool deviceConnected = false;
uint8_t txValue = 0;
BLECharacteristic *pCharacteristic;

class Lights {
  public:
  
    Adafruit_TLC59711 ledDriver = Adafruit_TLC59711(1);
    int engine_glow = 0;
    int engine_flicker = 0;
    int new_glow = 50;
    int new_flicker = 30;

    bool effectPlaying = false;
  
    Lights() {
      pinMode(BRIDGE_GND, OUTPUT);
      digitalWrite(BRIDGE_GND, LOW);
      ledcSetup(0, 5000, 8);
      ledcAttachPin(BRIDGE_PIN, 0);
      if (ledDriver.begin()) {
        Serial.println("LED Driver initiated");
      } else {
        Serial.println("LED Driver failed to init");
      }
      for (int i = 0; i < 12; i = i + 1) {
        ledDriver.setPWM(i, 0);
      }
    }

    void pulse() {        
      for (int i = 0; i < NUM_ENGINES; i++) {
        int engine_value = (engine_glow + random(-engine_flicker, 0) / 100.0 * engine_glow) / 100.0 * MAX_DUTY_CYCLE;
        if (engine_value > MAX_DUTY_CYCLE) {
            engine_value = MAX_DUTY_CYCLE;
        }
        set_engine(i, engine_value);
      }
    }
  
    void pulse_engines() {
      if (!effectPlaying) {
        if (deviceConnected) {
          ledcWrite(0, 255);
        } else {
          ledcWrite(0, 0);
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

        pulse();

      } 
      delay(10);
    }

    void set_engine(int engine, int val) {
      if (val > MAX_DUTY_CYCLE) {
        val = MAX_DUTY_CYCLE;
      }
      ledDriver.setPWM(engine, val);
      ledDriver.write();
    }

    void set_engines(int val) {
      for (int i = 0; i < NUM_ENGINES; i++) {
        set_engine(i, val);
      }
    }

    void alarm() {
      ledcWrite(0, 0);
      delay(350);
      int diff = 1;
      for (int i = 255; i > 0; i = i = i - 1) {
        ledcWrite(0, i);
        delay(5);
      }
      ledcWrite(0, 0);
      delay(500);
    }

    void pursuit() {
      int save_flicker = engine_flicker;
      int save_glow = engine_glow;
      engine_flicker = 50;
      for (engine_glow = 0; engine_glow < 100; engine_glow++) {
         pulse();
         delay(50);
      }
      engine_flicker = save_flicker;
      engine_glow = save_glow;
    }

    void launch() {
      set_engines(0);
      delay(3400);
      for (int i = 0; i < 11; i++) {
        if (i % 2 == 0) {
          set_engine(i, MAX_DUTY_CYCLE / 16);
        } else {
          set_engine(11 - i, MAX_DUTY_CYCLE / 16);
        }
        delay(100);
      }
      for (int i = 0; i < 11; i++) {
        if (i % 2 == 1) {
          set_engine(i, MAX_DUTY_CYCLE / 16);
        } else {
          set_engine(11 - i, MAX_DUTY_CYCLE / 16);
        }
        delay(100);
      }
      int save_flicker = engine_flicker;
      int save_glow = engine_glow;
      engine_glow = 10;
      engine_flicker = 50;
      for (int i = 0; i < 100; i++) {
         pulse();
         delay(20);
      }          
      delay(1000);
      engine_flicker = 0;
      for (engine_glow = 100; engine_glow < 70; engine_glow--) {
         engine_flicker = (100 - engine_glow) * 2;
         pulse();
         delay(30);
      }
      engine_flicker = save_flicker;
      engine_glow = save_glow;      
    }
    
    void effect(std::string param) {
        effectPlaying = true;
        if (param.compare("launch") == 0) {
          launch();
        }
        if (param.compare("pursuit") == 0) {
          pursuit();
        }
        if (param.compare("alarm") == 0) {
          alarm();
          alarm();
        }
        effectPlaying = false;
    }
    
    void glow(std::string param) {
        new_glow = atoi( param.c_str() );
        Serial.print("glow ");
        Serial.printf("%d\n", engine_glow);
    }
    
    void flicker(std::string param) {
        new_flicker = atoi(param.c_str() );
        Serial.print("flicker ");
        Serial.printf("%d\n", new_flicker);
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
        }
      }
    }
};

Lights *lights;

void setup() {
  Serial.begin(115200);
  Serial.println("Tantive IV Initiated");

  lights = new Lights();

  Serial.println("LED Driver initiated");
  
  // Create the BLE Device
  BLEDevice::init("Tantive IV");

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

