### Raspberry Pi Zero W Configuration Changes

The Pi Zero W draws a lot of current. This sometimes causes the Pi to be stuck in a boot loop. Therefore, to reduce power consumption, the following system configuration changes need to be made:

#### Disable Bluetooth

Edit `/boot/config.txt` and add `dtoverlay=pi3-disable-bt`. Also, disable the Bluetooth service using `sudo systemctl disable hciuart`.

#### Disable HDMI Output

Edit `/etc/rc.local`. Before the `exit 0` add the line `/usr/bin/tvservice -o`.

#### Disable the PiMoroni Speaker PHAT VU Meter

Make a backup of `/etc/asound.conf` and then delete it.

#### Optionally, disable the Pi Zero W LEDs

Edit `/boot/config.txt` and add `dtparam=act_led_trigger=none` and `dtparam=act_led_activelow=off`. This saves about 20 milliamps, but the indicator is helpful to determine if your device is boot looping.

