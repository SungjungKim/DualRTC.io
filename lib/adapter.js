'use strict';

// Holds the STUN/ICE server to use for PeerConnections.
var iceServers = function() {
    console.log('a1');

    if (navigator.mozGetUserMedia) {
        return {
            "iceServers": [{
                "url": "stun:23.21.150.121"
            }]
        };
    }
    return {
        "iceServers": [{
            "url": "stun:stun.l.google.com:19302"
        }]
    };
}

window.moz = !!navigator.mozGetUserMedia;

function RTCPeerConnection(options) {
    console.log('a2');

    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var optional = {
        optional: []
    };

    if (!moz) {
        optional.optional = [{
            DtlsSrtpKeyAgreement: true
        }];
    }

    var peer = new PeerConnection(iceServers(), optional);

    peer.onicecandidate = function(event) {
        console.log('a3');

        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            peer.addStream(streams[i]);
        }
    }

    peer.onaddstream = function(event) {
        console.log('a4');

        var remoteMediaStream = event.stream;

        // onRemoteStreamEnded(MediaStream)
        remoteMediaStream.onended = function() {
            console.log('a5');

            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
        };

        // onRemoteStream(MediaStream)
        if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

        console.debug('on:add:stream', remoteMediaStream);
    };

    var constraints = options.constraints || {
            optional: [],
            mandatory: {
                OfferToReceiveAudio: false,
                OfferToReceiveVideo: true
            }
        };

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(function(sessionDescription) {
            console.log('a5');

            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        console.log('a6');

        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
        peer.createAnswer(function(sessionDescription) {
            console.log('a7');

            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
        }, onSdpError, constraints);
    }

    function setBandwidth(sdp) {
        console.log('a8');

        if (moz) return sdp;
        if (navigator.userAgent.toLowerCase().indexOf('android') > -1) return sdp;

        // removing existing bandwidth lines
        sdp = sdp.replace(/b=AS([^\r\n]+\r\n)/g, '');

        // "10000kbit/s" for screen sharing
        sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:200000\r\n');
        //sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:500\r\n');

        return sdp;
    }

    peer.oniceconnectionstatechange = function() {
        console.log('a9');

        options.oniceconnectionstatechange(peer);
    };

    createOffer();
    createAnswer();

    function onSdpSuccess() {
        console.log('a10');
    }

    function onSdpError(e) {
        console.log('a11');
        console.error('sdp error:', JSON.stringify(e, null, '\t'));
    }

    return {
        addAnswerSDP: function(sdp) {
            console.log('a12');

            console.log('setting remote description', sdp.sdp);
            peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            console.log('a13');

            console.log('adding candidate', candidate.candidate);

            peer.addIceCandidate(new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            }));
        },

        peer: peer
    };
}

// getUserMedia
var video_constraints = {
    mandatory: {},
    optional: []
};

function getUserMedia(options) {
    console.log('a14');

    var n = navigator, media;
    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
            audio: false,
            video: video_constraints
        }, streaming, options.onerror || function (e) {
            console.log('a15');

            console.error(e);
        });

    function streaming(stream) {
        console.log('a16');

        var video = options.video;
        if (video) {
            video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
            video.play();
        }
        options.onsuccess && options.onsuccess(stream);
        media = stream;
    }

    return media;
}