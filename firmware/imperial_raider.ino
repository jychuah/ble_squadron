#include "application.h"

int engine_glow = 255;
int engine_flicker = 40;
int new_glow = -1;
int new_flicker = -1;

int effect(String extra) {
    Serial.print("Effect: ");
    Serial.println(extra);
    return 1;
}

int engine(String extra) {
    new_glow = extra.substring(0, extra.indexOf(",")).toInt();
    new_flicker = extra.substring(extra.indexOf(",") + 1).toInt();
    Serial.print("Engine glow");
    Serial.println(new_glow);
    Serial.print("Engine flicker");
    Serial.println(new_flicker);
    return 1;
}

int powerdown(String extra) {
    Serial.println("Soft power down");
    return 1;
}

void setup() {
    Particle.function("effect", effect);
    Particle.function("engine", engine);
    Particle.function("powerdown", powerdown);
}

void loop() {
}
