![Logo](admin/ebusd.png)
# ioBroker.ebusd
=================

This adapter allows connect EBUSD to ioBroker.

To enable the connection ebusd have to run on a system. 
For installation instruction you can read entry in wiki of fhem system and/or blog entry of Alexey:

http://baublog.ozerov.de/waermepumpe/vwmon-datenlogger-fuer-die-vaillant-waermepumpe/

https://wiki.fhem.de/wiki/EBUS 

Configure ip of host and port of ebusd. 
Also have to setup up path to the ebusd config files for auto read all possible variables are avaiable on ebus.

The adapter read out with the command "i" all devices detected on ebus and use the csv-Files from ebusd config to create possible states.

All the states automatically will be updated all 60 seconds.

## Supported ebusd versions
- ebusd 3.0.v3.0

## Changelog
#### 0.1.0
* (XKEYFA) initial release (only read from bus)

## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
