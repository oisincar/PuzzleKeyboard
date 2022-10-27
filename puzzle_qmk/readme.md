# puzzle

*An acrylic split keyboard that fits together*

* Keyboard Maintainer: [oisincar](https://github.com/oisincar)
* Hardware Supported: *Arduino Pro Micro (And maybe others)*
* Hardware Availability: *See the above repo!*

## Initial setup
Soft link this directory into your qmk_firmware directory.
```
# From this directory
ln -s "$(pwd)" ~/qmk_firmware/keyboards/puzzle
```

And test it's working correctly...
```
qmk list-keyboards | grep puzzle
```

## Pinout...
It's very likely you'll need to change the pins used by each half (config.h). Additionally if you don't make the same wiring mistake I do, you can undo the fix explained in puzzle.h.

## QMK
Make example for this keyboard (after setting up your build environment):

    make puzzle:default

Flashing example for this keyboard:

    make puzzle:default:flash

See the [build environment setup](https://docs.qmk.fm/#/getting_started_build_tools) and the [make instructions](https://docs.qmk.fm/#/getting_started_make_guide) for more information. Brand new to QMK? Start with our [Complete Newbs Guide](https://docs.qmk.fm/#/newbs).
