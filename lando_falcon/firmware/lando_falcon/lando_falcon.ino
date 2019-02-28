#include "Tlc59711.h"
#include "PinChangeInterrupt.h"

#define NUM_TLC             1
#define MAX_PWM             55000
#define ARC_SELECT_OUTPUT   3
#define ARC_SELECT_INPUT    4
#define NUM_ENGINES         4

Tlc59711 tlc(NUM_TLC, 1, 0);
int engine_pulse = 20;
int engine_glow = 100;
int engine_rate = 500;
int engine_pins[ NUM_ENGINES ] = { 0, 2, 3, 5 };
int engine_values[ NUM_ENGINES ] = { 0, 0, 0, 0 };
int engine_limits [ NUM_ENGINES ] = { MAX_PWM, MAX_PWM, MAX_PWM, MAX_PWM };
int engine_directions[ NUM_ENGINES ] = { 1, 1, 1, 1 };
int arc_channels[4] = { 7, 9 };
int headlight_channels[2] = { 6, 11 };
volatile int clicks = 0;
int current_arc_index = 0;

void interrupt_handler() {
  clicks = clicks + 1;
}

void set_limit(int pin) {
  int percent = (int)(engine_pulse / 100.0 * engine_glow);
  engine_limits[pin] = engine_directions[pin] * random(percent / 2, percent) / 100.0 * MAX_PWM + engine_values[pin];
  if (engine_limits[pin] > MAX_PWM) {
    engine_limits[pin] = MAX_PWM;
  }
  if (engine_limits[pin] < 0) {
    engine_limits[pin] = 0;
  }
}

void switch_directions(int pin) {
  engine_directions[pin] = engine_directions[pin] * -1;
  set_limit(pin);
}

void setup() {
  pinMode(ARC_SELECT_OUTPUT, OUTPUT);
  digitalWrite(ARC_SELECT_OUTPUT, HIGH);
  pinMode(2, OUTPUT);
  digitalWrite(2, HIGH);
  pinMode(ARC_SELECT_INPUT, INPUT);
  attachPCINT(digitalPinToPCINT(ARC_SELECT_INPUT), interrupt_handler, RISING);
  tlc.beginSlow();
}

void loop() {
  if (clicks > 0) {
    clicks = 0;
    current_arc_index = (current_arc_index + 1) % 2;
  }
  
  for (int i = 0; i < NUM_ENGINES ; i++) {
    
    engine_values[i] += engine_directions[i] * engine_rate;
    if (engine_values[i] > MAX_PWM) {
      engine_values[i] = MAX_PWM;
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
    tlc.setChannel(engine_pins[i], engine_values[i]);
  }
  
  for (int i = 0; i < 2; i++) {
    tlc.setChannel(arc_channels[i], 0);
  }
  
  tlc.setChannel(arc_channels[current_arc_index], MAX_PWM);
  for (int i = 0; i < 2; i++) {
    tlc.setChannel(headlight_channels[i], MAX_PWM);
  }
  tlc.write();
  delay(10);
}
