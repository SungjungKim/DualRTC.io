
# dualRTC.io
Dual monitor system based on WebRTC(Web Real-Time Communication)

# Table of Contents

- [What is WebRTC?](#what-is-webrtc?)
- [Support](#support)
- [Prerequisites](#prerequisites)
- [Reference](#reference)
- [License](#license)

# What is WebRTC?
![alt img](https://github.com/UCIUROP2015/UCI_UROP_WEBRTC/blob/master/images/logo-webrtc.png)<br>
webRTC is a new webstandard being developed for peer-to-peer communication on the web. This means that browsers will be able to send information, without sending information through the server. Server side this will reduce load dramatically.

Currently the webRTC standard is very focused on the video & audio aspects of the project. In the future (hopefully near future!) they will begin implementing the data channel, which will allow arbitrary data to be sent peer-to-peer. For now the webRTC team is focused on stabalizing and optimizing the video and audio channels.

Unfortunately, a server (or two servers) will still be required for two reasons, The media for the page must be initially supplied, and the server, in conjunction with a [STUN server](http://en.wikipedia.org/wiki/STUN), is required to synchronize the connections.

# Support

### Device
* HOST : Windows 7 64-bit
* GUEST : ANY DEVICE

### Browser
* Chrome 25.0+ (28.0+ for best performance)
* Firefox 22.0+

# Prerequisite

### Technologies

* *Node.js* - Install [Node.js](http://nodejs.org/download/) and Manager node version using [nvm(Node Version Manager)](https://github.com/creationix/nvm").
```bash
$ sudo apt-get update
$ sudo apt-get install build-essential libssl-dev
$ curl https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash
$ nvm install 4.2.1
$ nvm use 4.2.1
```

* *Chrome Extensions*


# Reference
* [WebRTC 1.0: Real-time Communication Between Browsers](http://www.w3.org/TR/2015/WD-webrtc-20150210/)

# License
The MIT License. Please see [the license file](LICENSE) for more information.
