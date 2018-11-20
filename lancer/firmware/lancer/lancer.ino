#include "Tlc59711.h"
#include "PinChangeInterrupt.h"

#define NUM_TLC             1
#define MAX_PWM             40000
#define ARC_SELECT_OUTPUT   3
#define ARC_SELECT_INPUT    4

Tlc59711 tlc(NUM_TLC, 2, 0);
int engine_channels[] = { 0, 4, 5 };
int arc_channels[4] = { 6, 8, 9, 11 };
int headlight_channel = 2;
volatile int clicks = 0;
int current_arc_index = 0;

void interrupt_handler() {
  clicks = clicks + 1;
}

void setup() {
  pinMode(ARC_SELECT_OUTPUT, OUTPUT);
  digitalWrite(ARC_SELECT_OUTPUT, HIGH);
  pinMode(ARC_SELECT_INPUT, INPUT);
  attachPCINT(digitalPinToPCINT(ARC_SELECT_INPUT), interrupt_handler, RISING);
  tlc.beginSlow();
}

void loop() {
  if (clicks > 0) {
    clicks = 0;
    current_arc_index = (current_arc_index + 1) % 4;
  }
  for (int i = 0; i < 3; i++) {
    tlc.setChannel(engine_channels[i], MAX_PWM - random(10000));
  }
  for (int i = 0; i < 4; i++) {
    tlc.setChannel(arc_channels[i], 0);
  }
  tlc.setChannel(arc_channels[current_arc_index], MAX_PWM);
  
  tlc.setChannel(headlight_channel, MAX_PWM);
  tlc.write();
  delay(200);
}
