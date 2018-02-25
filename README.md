# X-Wing Miniatures Imperial Raider with Sound Effects

This code repository contains source files and circuit schematics for adding light and sound effects to an X-Wing Miniatures Imperial Raider, controlled with an app through WiFi.

DISCLAIMER: I take no responsibility for your Imperial Raider turning into an expensive heap of broken plastic. It was *very* touch and go for a lot of this project.

### Requirements

I constructed this using the following additional hardware:

- [Particle.io Photon](https://www.adafruit.com/product/2721)
- [Adafruit Audio FX Sound Board + 2x2W Amp](https://www.adafruit.com/product/2217)
- [Adafruit 16-Channel 12-bit PWM/Servo Driver](https://www.adafruit.com/product/815)
- [Adafruit PowerBoost 1000C](https://www.adafruit.com/product/2465)
- [2000 mAh Battery](https://www.adafruit.com/product/2011)

Additional components included:

- [Slide Switch](https://www.adafruit.com/product/805)
- A piece of positive/negative supply rail from an [Adafruit Perma Proto board](https://www.adafruit.com/product/1608)
- An 8 Ohm 2W speaker from a [PiMoroni Speaker pHat](https://www.adafruit.com/product/3401)
- [Right angle headers](https://www.adafruit.com/product/1540)
- Assorted LEDs
- Jumper Wires
- Super glue and gorilla tape

Tools needed:

- Soldering iron/solder
- Dremel with [Engraving Kit](https://www.amazon.com/dp/B00IGITT8C/ref=asc_df_B00IGITT8C5382567/?tag=hyprod-20&creative=395009&creativeASIN=B00IGITT8C&linkCode=df0&hvadid=241955516116&hvpos=1o1&hvnetw=g&hvrand=17791976209422715378&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9028321&hvtargid=pla-409309069868)
- Drill

Skills needed:

- A little bit of coding skills
- The ability to use a command line terminal and not be afraid of it
- Minor soldering skills
- A very steady hand for cutting through your Imperial Raider miniature and carving out some holes

### In this repo

- [A Fritzing diagram of the component connections](./fritzing)
- [Firmware source for the Particle.io Photon](./firmware)
- [Ionic Framework source code for the control app](./ionic_app)
