'use strict';

var dualrtc = function(config) {
    var self = {
            userToken: uniqueToken()
        },
        channels = '--',
        isbroadcaster,
        isGetNewRoom = true,
        participants = 0,
        num_rooms = 1,
        defaultSocket = {};

    var sockets = [];

    function openDefaultSocket() {
        console.log('1');

        defaultSocket = config.openSocket({
            onmessage: defaultSocketResponse,
            callback: function(socket) {
                defaultSocket = socket;
            }
        });
    }

    function defaultSocketResponse(response) {
        console.log('2');
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken,
                closeSocket: true
            });
        }
    }

    function openSubSocket(_config) {
        console.log('3');

        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                console.log('4');

                if (isofferer && !peer) initPeer();
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            console.log('4');

            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            htmlElement = document.createElement('video'),
            inner = {},
            peer;

        var peerConfig = {
            oniceconnectionstatechange: function(p) {
                console.log('5');

                if(!isofferer || peer.firedOnce) return;

                if(p.iceConnectionState == 'failed') {
                    peer.firedOnce = true;
                    config.oniceconnectionstatechange('failed');
                }

                if(p.iceConnectionState == 'connected' && p.iceGatheringState == 'complete' && p.signalingState == 'stable') {
                    peer.firedOnce = true;
                    config.oniceconnectionstatechange('connected');
                }
            },
            attachStream: config.attachStream,
            onICE: function(candidate) {
                console.log('6');

                socket && socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function(stream) {
                console.log('7');

                htmlElement[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                htmlElement.play();

                _config.stream = stream;
                afterRemoteStreamStartedFlowing();
            }
        };

        function initPeer(offerSDP) {
            console.log('8');

            if (!offerSDP) peerConfig.onOfferSDP = sendsdp;
            else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }
            peer = RTCPeerConnection(peerConfig);
        }

        function afterRemoteStreamStartedFlowing() {
            console.log('9');

            gotstream = true;

            config.onRemoteStream({
                video: htmlElement
            });

            /* closing sub-socket here on the offerer side */
            if (_config.closeSocket) socket = null;
        }

        function sendsdp(sdp) {
            console.log('10');

            sdp = JSON.stringify(sdp);
            var part = parseInt(sdp.length / 3);

            var firstPart = sdp.slice(0, part),
                secondPart = sdp.slice(part, sdp.length - 1),
                thirdPart = '';

            if (sdp.length > part + part) {
                secondPart = sdp.slice(part, part + part);
                thirdPart = sdp.slice(part + part, sdp.length);
            }

            socket && socket.send({
                userToken: self.userToken,
                firstPart: firstPart
            });

            socket && socket.send({
                userToken: self.userToken,
                secondPart: secondPart
            });

            socket && socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart
            });
        }

        function socketResponse(response) {
            console.log('11');

            if (response.userToken == self.userToken) return;
            if (response.firstPart || response.secondPart || response.thirdPart) {
                if (response.firstPart) {
                    inner.firstPart = response.firstPart;
                    if (inner.secondPart && inner.thirdPart) selfInvoker();
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart && inner.thirdPart) selfInvoker();
                }

                if (response.thirdPart) {
                    inner.thirdPart = response.thirdPart;
                    if (inner.firstPart && inner.secondPart) selfInvoker();
                }
            }

            if (response.candidate && !gotstream) {
                peer && peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });
            }

            if (response.left) {
                participants--;
                if (isofferer && config.onNewParticipant) config.onNewParticipant(participants);

                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            console.log('12');

            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);
            if (isofferer && inner.sdp.type == 'answer') {
                peer.addAnswerSDP(inner.sdp);
                participants++;
                if (config.onNewParticipant) config.onNewParticipant(participants);
            } else initPeer(inner.sdp);
        }
    }

    function leave() {
        console.log('13');

        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }

        // if owner leaves; try to remove his room from all other users side
        if (isbroadcaster) {
            defaultSocket.send({
                left: true,
                userToken: self.userToken,
                roomToken: self.roomToken
            });
        }

        if (config.attachStream) config.attachStream.stop();
    }

    window.addEventListener('beforeunload', function() {
        console.log('116,');

        leave();
    }, false);

    window.addEventListener('keyup', function(e) {
        console.log('116');

        if (e.keyCode == 116)
            leave();
    }, false);

    function startBroadcasting() {
        console.log('14');

        defaultSocket && defaultSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        console.log('15');

        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel,
            closeSocket: true
        });

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: new_channel
        });
    }

    function uniqueToken() {
        console.log('16');

        return Math.random().toString(36).substr(2, 35);
    }

    openDefaultSocket();
    return {
        createRoom: function(_config) {
            console.log('17');

            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            num_rooms++;
            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {
            console.log('18');

            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            openSubSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        }
    };
};