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

#define     LEFT_HEADLIGHT      4
#define     RIGHT_HEADLIGHT     11
#define     NUM_ENGINES         5

#define     MAX_DUTY_CYCLE      4000

bool deviceConnected = false;
uint8_t txValue = 0;
BLECharacteristic *pCharacteristic;

class Lights {
  public:
  
    Adafruit_PWMServoDriver ledDriver = Adafruit_PWMServoDriver();
    int engine_glow = 80;
    int engine_pulse = 20;
    int engine_rate = 40;
    int headlight_intensity = 50;

    int engine_pins [ NUM_ENGINES ] = { 1, 2, 6, 7, 8 };
    int engine_values[ NUM_ENGINES ];
    int engine_limits [ NUM_ENGINES ];
    int engine_directions[ NUM_ENGINES ];
    bool effectPlaying = false;

    void set_limit(int pin) {
        int percent = (int)(engine_pulse / 100.0 * engine_glow);
        engine_limits[pin] = engine_directions[pin] * random(percent / 2, percent) / 100.0 * MAX_DUTY_CYCLE + engine_values[pin];
        if (engine_limits[pin] > MAX_DUTY_CYCLE) {
          engine_limits[pin] = MAX_DUTY_CYCLE;
        }
        if (engine_limits[pin] < 0) {
          engine_limits[pin] = 0;
        }
    }

    void set_headlights(int val) {
      ledDriver.setPin(LEFT_HEADLIGHT, val);
      ledDriver.setPin(RIGHT_HEADLIGHT, val);
    }

    void switch_directions(int pin) {
      engine_directions[pin] = engine_directions[pin] * -1;
      set_limit(pin);
    }
  
    Lights() {
      engine_pins[ 0 ] = 1;
      engine_pins[ 1 ] = 2;
      engine_pins[ 2 ] = 6;
      engine_pins[ 3 ] = 7;
      engine_pins[ 4 ] = 8;
      ledDriver.begin();
      for (int i = 0; i <= 15; i = i + 1) {
        ledDriver.setPin(i, 0);
      }
      for (int i = 0; i < NUM_ENGINES; i++) {
        engine_directions[i] = pow(-1, i + 1);
        engine_values[i] = engine_glow / 100.0 * MAX_DUTY_CYCLE;        
        set_limit(i);
      }
    }
  
    void pulse_engines() {
      set_headlights( (int)(MAX_DUTY_CYCLE * 0.25 * headlight_intensity / 100.0));

      if (!effectPlaying) {
        for (int i = 0; i < NUM_ENGINES; i++) {
          engine_values[i] += engine_directions[i] * engine_rate;
          if (engine_values[i] > MAX_DUTY_CYCLE) {
            engine_values[i] = MAX_DUTY_CYCLE;
          }
          if (engine_values[i] < 0) {
            engine_values[i] = 0;
          }
          if (engine_directions[i] < 0) {
            if (engine_values[i] <= engine_limits[i]) {
              switch_directions(i);
            }
          } else {
            if (engine_values[i] >= engine_limits[i]) {
              switch_directions(i);
            }
          }
          ledDriver.setPin(engine_pins[i], engine_values[i]);
        }
      }
  
      delay(10);

    }

    void set_engines(int val) {
      for (int i = 0; i < NUM_ENGINES; i++) {
        ledDriver.setPin(engine_pins[i], val);
      }
    }
    
    void blaster() {
      for (int i = 0; i < 14; i++) {
        for (int j = 1; j < MAX_DUTY_CYCLE; j = j * 2) {
          set_headlights(j);
          delay(12);
        }
      }
    }

    void hyperdrive() {
      for (int i = 0; i < 1100; i++) {
        set_engines(i);
        delay(1);
      }
      set_engines(MAX_DUTY_CYCLE);
      delay(800);
      for (int i = MAX_DUTY_CYCLE; i > 1150; i = i - 6) {
        set_engines(i);
        delay(1);
      }
    }

    void launch() {
      set_engines(100);
      set_headlights(500);
      delay(250);
      set_headlights(1);
      delay(250);
      set_headlights(500);
      delay(250);
      set_headlights(1);
      delay(250);
      set_headlights(2048);
      for (int i = 100; i < 1350; i++) {
        set_engines(i);
        delay(1);
      }
      for (int i = 0; i < 10; i++) {
        for (int j = MAX_DUTY_CYCLE / 2; j < MAX_DUTY_CYCLE; j = j + 30) {
          set_engines(j);
          delay(1);
        }
        for (int j = MAX_DUTY_CYCLE; j > MAX_DUTY_CYCLE / 2; j = j - 30) {
          set_engines(j);
          delay(1);
        }
      }
    }

    void notmyfault() {
      set_engines(300);
      delay(1000);
      for (int i = 1000; i < MAX_DUTY_CYCLE; i = i + 30) {
        set_engines(i);
        delay(10);
      }
      set_engines(MAX_DUTY_CYCLE);
      for (int i = 0; i < 10; i++) {
        for(int j = MAX_DUTY_CYCLE - i * 300; j > 1; j = j / 2) {
          set_engines(j);
          delay(25 + i);
        }
      }
      set_engines(200);
      delay(4200);
      
    }

    void watchwhat() {
      set_engines(300);
      delay(1300);
      for (int i = 1000; i < MAX_DUTY_CYCLE; i = i + 30) {
        set_engines(i);
        delay(7);
      }
      set_engines(MAX_DUTY_CYCLE);
      for (int i = 0; i < 8; i++) {
        for(int j = MAX_DUTY_CYCLE - i * 300; j > 1; j = j / 2) {
          set_engines(j);
          delay(25 + i);
        }
      }
      set_engines(200);
      delay(1400);
    }
    
    void effect(std::string param) {
        effectPlaying = true;
        if (param.compare("blaster") == 0) {
            blaster();
        }
        if (param.compare("hyperdrive") == 0) {
            hyperdrive();
        }
        if (param.compare("launch") == 0) {
            launch();
        }
        if (param.compare("notmyfault") == 0) {
            notmyfault();
        }
        if (param.compare("watchwhat") == 0) {
            watchwhat();
        }
        effectPlaying = false;
    }
    
    void glow(std::string param) {
        engine_glow = atoi( param.c_str() );
        Serial.print("glow ");
        Serial.printf("%d\n", engine_glow);
    }
    
    void pulse(std::string param) {
        engine_pulse = atoi(param.c_str() );
        Serial.print("pulse ");
        Serial.printf("%d\n", engine_pulse);
    }
    
    void headlights(std::string param) {
        headlight_intensity = atoi(param.c_str() );
        Serial.print("headlights ");
        Serial.printf("%d\n", headlight_intensity);
    }

    void rate(std::string param) {
        engine_rate = atoi(param.c_str() );
        Serial.print("pulse rate ");
        Serial.printf("%d\n", engine_rate);
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
          if (command.compare("pulse") == 0) {
            lights->pulse(param);
          }
          if (command.compare("rate") == 0) {
            lights->rate(param);
          }
          if (command.compare("headlights") == 0) {
            lights->headlights(param);
          }
        }
      }
    }
};

Lights *lights;

void setup() {
  Serial.begin(115200);
  Serial.println("Millenium Falcon Initiated");

  lights = new Lights();

  Serial.println("LED Driver initiated");
  
  // Create the BLE Device
  BLEDevice::init("Millenium Falcon");

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

