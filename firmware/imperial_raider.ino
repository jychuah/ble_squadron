SYSTEM_MODE(SEMI_AUTOMATIC);

// This #include statement was automatically added by the Particle IDE.
#include "Adafruit_PCA9685.h"

// This #include statement was automatically added by the Particle IDE.
#include "Adafruit_Soundboard.h"


#define     SFX_RST             2
#define     STATUS_LED          7
#define     ENGINE_LEFT_PIN     0
#define     ENGINE_RIGHT_PIN    1
#define     ENGINE_CENTER_PIN   2
#define     STARBOARD_ARC_PIN   8
#define     PORT_ARC_PIN        9
#define     FORWARD_ARC_PIN     10
#define     SPOTLIGHT_PIN       11

#define     FX_SIREN            1
#define     FX_TURBOLASER       2
#define     FX_ENGINEWASH       3
#define     FX_MARCH            4
#define     FX_PEWPEW           5
#define     MAX_DUTY_CYCLE      4095

Adafruit_Soundboard sfx = Adafruit_Soundboard(&Serial1, NULL, SFX_RST);
Adafruit_PCA9685 ledDriver = Adafruit_PCA9685(0x40, false);  // Use the default address, but also turn on debugging

bool firstConnected = false;
bool soundBoard = false;

double engine_glow = 0;
double engine_flicker = 0;
double spotlight_intensity = 0;
int new_glow = 50;
int new_flicker = 15;
int new_spotlight = 60;

void siren() {
    digitalWrite(STATUS_LED, LOW);
    delay(400);
    sfx.playTrack(FX_SIREN);
    digitalWrite(STATUS_LED, HIGH);
    delay(1200);
    digitalWrite(STATUS_LED, LOW);
    delay(1000);
    digitalWrite(STATUS_LED, HIGH);
    delay(1200);
    digitalWrite(STATUS_LED, LOW);
    delay(1000);
}

void fire(int pin, int decay_rate) {
    int delayVal = 40;
    for (int i = MAX_DUTY_CYCLE; i >= 0 && delayVal > 0; i = i - decay_rate) {
        if (i < 0) {
            i = 0;
        }
        ledDriver.setVal(pin, i);
        delay(delayVal);
        delayVal = delayVal - 1;
    }
    ledDriver.setVal(pin, 0);
    delay(80);
}

void fire_all(int decay_rate) {
    int delayVal = 40;
    for (int i = MAX_DUTY_CYCLE; i >= 0 && delayVal > 0; i = i - decay_rate) {
        if (i < 0) {
            i = 0;
        }
        ledDriver.setVal(STARBOARD_ARC_PIN, i);
        ledDriver.setVal(PORT_ARC_PIN, i);
        ledDriver.setVal(FORWARD_ARC_PIN, i);
        delay(delayVal);
        delayVal = delayVal - 1;
    }
    ledDriver.setVal(STARBOARD_ARC_PIN, 0);
    ledDriver.setVal(PORT_ARC_PIN, 0);
    ledDriver.setVal(FORWARD_ARC_PIN, 0);
    delay(80);
}

void wash() {
    ledDriver.setVal(ENGINE_LEFT_PIN, 0);
    ledDriver.setVal(ENGINE_RIGHT_PIN, 0);
    ledDriver.setVal(ENGINE_CENTER_PIN, 0);
    delay(400);
    sfx.playTrack(FX_ENGINEWASH);
    for (int i = 500; i < MAX_DUTY_CYCLE; i = i + 10) {
        int engine_val = i + random(-600, 0);
        if (engine_val < 0) {
            engine_val = 0;
        }
        ledDriver.setVal(ENGINE_LEFT_PIN, engine_val);
        ledDriver.setVal(ENGINE_CENTER_PIN, engine_val);
        ledDriver.setVal(ENGINE_RIGHT_PIN, engine_val);
        delay(10);
    }
}

void march() {
    int SET1 = MAX_DUTY_CYCLE;
    int SET2 = 0;
    sfx.playTrack(FX_MARCH);
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

        ledDriver.setVal(ENGINE_CENTER_PIN, SET1);
        ledDriver.setVal(STARBOARD_ARC_PIN, SET1);
        ledDriver.setVal(PORT_ARC_PIN, SET1);
        ledDriver.setVal(ENGINE_LEFT_PIN, SET2);
        ledDriver.setVal(ENGINE_RIGHT_PIN, SET2);
        ledDriver.setVal(FORWARD_ARC_PIN, SET2);
        ledDriver.setVal(SPOTLIGHT_PIN, SET2);
        delay(575);
    }
    for (int i = 0; i < 11; i++) {
        ledDriver.setVal(i, 0);
    }
}

void pewpew() {
    sfx.playTrack(FX_PEWPEW);
    fire_all(1150);
    fire_all(500);
    fire_all(1150);
    fire_all(100);
}

int effect(String param = "") {
    if (param.compareTo("pewpew") == 0) {
        pewpew();
        return 1;
    }
    if (param.compareTo("march") == 0) {
        march();
        return 1;
    }
    if (param.compareTo("wash") == 0) {
        wash();
        return 1;
    }
    if (param.compareTo("siren") == 0) {
        siren();
        return 1;
    }
    if (param.compareTo("firestar") == 0) {
        sfx.playTrack(FX_TURBOLASER);
        fire(STARBOARD_ARC_PIN, 425);
        fire(STARBOARD_ARC_PIN, 100);
        return 1;
    }
    if (param.compareTo("fireport") == 0) {
        sfx.playTrack(FX_TURBOLASER);
        fire(PORT_ARC_PIN, 425);
        fire(PORT_ARC_PIN, 100);
        return 1;
    }
    if (param.compareTo("firestern") == 0) {
        sfx.playTrack(FX_TURBOLASER);
        fire(FORWARD_ARC_PIN, 425);
        fire(FORWARD_ARC_PIN, 100);
        return 1;
    }
    return -1;
}

int engine(String extra) {
    new_glow = extra.substring(0, extra.indexOf(",")).toInt();
    new_flicker = extra.substring(extra.indexOf(",") + 1).toInt();
    return 1;
}

int spotlight(String extra) {
    new_spotlight = extra.toInt();
    return 1;
}

void setup() {
    pinMode(STATUS_LED, OUTPUT);
    ledDriver.begin();    // This calls Wire.begin()
    ledDriver.setPWMFreq(1000);     // Maximum PWM frequency is 1600
    for (int i = 0; i <= 11; i = i + 1) {
        ledDriver.setVal(i, 0);
    }

    Serial1.begin(9600);
    soundBoard = sfx.reset();
    sfx.playTrack(FX_ENGINEWASH);
    WiFi.on();
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

    if (new_spotlight != -1) {
        if (new_spotlight > spotlight_intensity) {
            spotlight_intensity++;
        } else if (new_spotlight < spotlight_intensity) {
            spotlight_intensity--;
        } else if (new_spotlight == spotlight_intensity) {
            new_spotlight = -1;
        }
        ledDriver.setVal(SPOTLIGHT_PIN, (int)(spotlight_intensity / 100.0 * MAX_DUTY_CYCLE));
    }

    int engine_value = (engine_glow + random(-engine_flicker, 0) / 100.0 * engine_glow) / 100.0 * MAX_DUTY_CYCLE;
    if (engine_value > MAX_DUTY_CYCLE) {
        engine_value = MAX_DUTY_CYCLE;
    }
    ledDriver.setVal(ENGINE_CENTER_PIN, engine_value);
    ledDriver.setVal(ENGINE_LEFT_PIN, engine_value);
    ledDriver.setVal(ENGINE_RIGHT_PIN, engine_value);

    delay(10);

    if (WiFi.ready()) {
        if (!Particle.connected()) {
            Particle.connect();
            digitalWrite(STATUS_LED, HIGH);
            delay(500);
            digitalWrite(STATUS_LED, LOW);
            delay(500);
        } else {
            digitalWrite(STATUS_LED, HIGH);
            if (!firstConnected) {
                firstConnected = true;
                Particle.publish("Imperial Raider Online");
                Particle.function("effect", effect);
                Particle.function("engine", engine);
                Particle.function("spotlight", spotlight);
                Particle.variable("glow", engine_glow);
                Particle.variable("flicker", engine_flicker);
                Particle.variable("spotval", spotlight_intensity);
            }
        }
    } else {
        // Play startup engine effect before trying to connect wifi
        if (new_glow == -1 && new_flicker == -1) {
            WiFi.connect();
        }
    }

}
