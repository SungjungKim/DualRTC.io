'use strict';

var config = {
    openSocket: function(config) {
        /*
         Firebase ver.
         */
        var channel = config.channel || 'screen-capturing-' + location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
        var socket = new Firebase('https://webrtc.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function(data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function(data) {
            this.push(data);
        };
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();

        return socket;

        /*
         Socket.io ver. (Not yet)
         */
        //var SIGNALING_SERVER = 'https://';
        //
        //config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        //var sender = Math.round(Math.random() * 999999999) + 999999999;
        //
        //io.connect(SIGNALING_SERVER).emit('new-channel', {
        //    channel: config.channel,
        //    sender: sender
        //});
        //
        //var socket = io.connect(SIGNALING_SERVER + config.channel);
        //socket.channel = config.channel;
        //socket.on('connect', function () {
        //    if (config.callback) config.callback(socket);
        //});
        //
        //socket.send = function (message) {
        //    socket.emit('message', {
        //        sender: sender,
        //        data: message
        //    });
        //};
        //
        //socket.on('message', config.onmessage);
    },
    onRemoteStream: function(media) {
        var video = media.video;
        video.setAttribute('controls', true);
        videosContainer.insertBefore(video, videosContainer.firstChild);
        video.play();
    },
    onRoomFound: function(room) {
        dualrtcUI.joinRoom({
            roomToken: room.broadcaster,
            joinUser: room.broadcaster
        });
    },
    onNewParticipant: function(numberOfParticipants) {
        //document.title = numberOfParticipants + ' users are viewing your screen!';
    },
    oniceconnectionstatechange: function(state) {
        if(state == 'failed') {
            alert('Failed to bypass Firewall rules.');
        }

        if(state == 'connected') {
            alert('A user successfully received screen.');
        }
    }
}; // end of config

function captureUserMedia(callback, extensionAvailable) {
    console.log('captureUserMedia chromeMediaSource', DetectRTC.screen.chromeMediaSource);

    var screen_constraints = {
        mandatory: {
            chromeMediaSource: DetectRTC.screen.chromeMediaSource,
            maxWidth: screen.width > 1920 ? screen.width : 1920,
            maxHeight: screen.height > 1080 ? screen.height : 1080
            // minAspectRatio: 1.77
        },
        optional: [{ // non-official Google-only optional constraints
            googTemporalLayeredScreencast: true
        }, {
            googLeakyBucket: true
        }]
    };
    // try to check if extension is installed.
    if(isChrome && typeof extensionAvailable == 'undefined' && DetectRTC.screen.chromeMediaSource != 'desktop') {
        DetectRTC.screen.isChromeExtensionAvailable(function(available) {
            captureUserMedia(callback, available);
        });
        return;
    }

    if(isChrome && DetectRTC.screen.chromeMediaSource == 'desktop' && !DetectRTC.screen.sourceId) {
        DetectRTC.screen.getSourceId(function(error) {
            if(error && error == 'PermissionDeniedError') {
                alert('PermissionDeniedError: User denied to share content of his screen.');
            }

            captureUserMedia(callback);
        });
        return;
    }

    if(isChrome && !DetectRTC.screen.sourceId) {
        window.addEventListener('message', function (event) {
            if (event.data && event.data.chromeMediaSourceId) {
                var sourceId = event.data.chromeMediaSourceId;
                DetectRTC.screen.sourceId = sourceId;
                DetectRTC.screen.chromeMediaSource = 'desktop';
                if (sourceId == 'PermissionDeniedError') {
                    return alert('User denied to share content of his screen.');
                }
                captureUserMedia(callback, true);
            }
            if (event.data && event.data.chromeExtensionStatus) {
                warn('Screen capturing extension status is:', event.data.chromeExtensionStatus);
                DetectRTC.screen.chromeMediaSource = 'screen';
                captureUserMedia(callback, true);
            }
        });
        return;
    }

    if(isChrome && DetectRTC.screen.chromeMediaSource == 'desktop') {
        screen_constraints.mandatory.chromeMediaSourceId = DetectRTC.screen.sourceId;
    }

    var constraints = {
        audio: false,
        video: screen_constraints
    };

    if(!!navigator.mozGetUserMedia) {
        console.warn(Firefox_Screen_Capturing_Warning);
        constraints.video = {
            mozMediaSource: 'window',
            mediaSource: 'window',
            maxWidth: 1920,
            maxHeight: 1080,
            minAspectRatio: 1.77
        };
    }

    var video = document.createElement('video');
    video.setAttribute('autoplay', true);
    video.setAttribute('controls', true);
    videosContainer.insertBefore(video, videosContainer.firstChild);

    getUserMedia({
        video: video,
        constraints: constraints,
        onsuccess: function(stream) {
            config.attachStream = stream;
            callback && callback();
            video.setAttribute('muted', true);
        },
        onerror: function() {
            if (isChrome && location.protocol === 'http:') {
                alert('Please test on HTTPS.');
            } else if(isChrome) {
                alert('Screen capturing is either denied or not supported. Please install chrome extension for screen capturing or run chrome with command-line flag: --enable-usermedia-screen-capturing');
            }
            else if(!!navigator.mozGetUserMedia) {
                alert(Firefox_Screen_Capturing_Warning);
            }
        }
    });
} // end of captureUserMedia


var dualrtcUI = dualrtc(config);
var videosContainer = document.getElementById('videos-container');
var secure = (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');

var makeName = $('#makeName');
var joinName = $('#joinName');

var btnMakeRoom = $('#btnMakeRoom');
var btnJoinRoom = $('#btnJoinRoom');
var btnCopy = $('#btnCopy');

var divMake = $('#divMakeRoom');
var divJoin = $('#divJoinRoom');
var divScreen = $('#divScreen');

// about description
var divDescript = $('#divDescript');
var divInstallCE01 = $('#divInstallCE01');
var divInstallCE02 = $('#divInstallCE02');
var divWikiWDDM = $('#divWikiWDDM');

btnMakeRoom.click(function () {
    if (makeName.val()) {
        makeName.attr('disabled', true);
        btnJoinRoom.attr('disabled', true);
        joinName.attr('disabled', true);
        btnJoinRoom.attr('disabled', true);

        window.open('about:black').location.href = location.href + makeName.val();
    }
});

btnJoinRoom.click(function () {
    if (joinName.val()) {
        joinName.attr('disabled', true);
        btnJoinRoom.attr('disabled', true);

        window.open('about:black').location.href = location.href + joinName.val();
    }
});

btnCopy.click(function () {
    makeName.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
    } catch(err) {
        console.log('Oops, unable to copy');
    }
});

divInstallCE01.click(function () {
    window.open('about:black').location.href = 'https://chrome.google.com/webstore/detail/desktopcapture/mhpddeoilenchcefgimjlbbccdiepnnk';
});

divInstallCE02.click(function () {
    window.open('about:black').location.href = 'https://chrome.google.com/webstore/detail/dualrtcio/kdgjponegkkhkigjlknapimncipajbpi';
});

divWikiWDDM.click(function () {
    window.open('about:black').location.href = 'https://dualrtc-io.github.io/';
});

(function() {

    if (location.hash.length <= 2) {
        makeName.val(secure);
        //makeName.attr('placeholder', secure);
    }
    else { // 방 들어왔을 때
        var roomName = location.hash.substring(2, 21);

        if (divMake.css('display') == 'block') $('#divMakeRoom').hide();
        if (divJoin.css('display') == 'block') $('#divJoinRoom').hide();
        if (divScreen.css('display') == 'none') $('#divScreen').show();
        if (divDescript.css('display') == 'block') $('#divDescript').hide();

        captureUserMedia(function() {
            dualrtcUI.createRoom({
                roomName: (roomName || 'Anonymous') + ' shared his screen with you'
            });
        });
    }
})();

var Firefox_Screen_Capturing_Warning = 'Make sure that you are using Firefox Nightly and you enabled: media.getusermedia.screensharing.enabled flag from about:config page. You also need to add your domain in "media.getusermedia.screensharing.allowed_domains" flag.';
