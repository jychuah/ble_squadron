#include "application.h"

#define ENGINE_PIN A0

double engine_glow = 40;
double engine_flicker = 15;
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
    Serial.print("Engine glow: ");
    Serial.println(new_glow);
    Serial.print("Engine flicker: ");
    Serial.println(new_flicker);
    return 1;
}

int powerdown(String extra) {
    Serial.println("Soft power down");
    return 1;
}

void setup() {
    pinMode(ENGINE_PIN, OUTPUT);
    Particle.function("effect", effect);
    Particle.function("engine", engine);
    Particle.function("powerdown", powerdown);
    Particle.variable("glow", engine_glow);
    Particle.variable("flicker", engine_flicker);
}

void loop() {
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
    int engine_value = (int)(engine_glow + random(-engine_flicker / 200.0 * engine_glow, engine_flicker / 200.0 * engine_glow));
    if (engine_value > 255) {
        engine_value = 255;
    }
    pinMode(ENGINE_PIN, OUTPUT);
    analogWrite(ENGINE_PIN, engine_value);
    delay(10);
}
