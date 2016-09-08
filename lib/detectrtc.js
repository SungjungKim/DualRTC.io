
// todo: need to check exact chrome browser because opera also uses chromium framework
var isChrome = !!navigator.webkitGetUserMedia;

var DetectRTC = {};

(function () {
    var screenCallback;
    DetectRTC.screen = {
        chromeMediaSource: 'screen',

        getSourceId: function(callback) {
            console.log('d1');

            if(!callback) throw '"callback" parameter is mandatory.';
            screenCallback = callback;
            window.postMessage('get-sourceId', '*');
        },
        isChromeExtensionAvailable: function(callback) {
            console.log('d2');

            if(!callback) return;

            if(DetectRTC.screen.chromeMediaSource == 'desktop') return callback(true);

            // ask extension if it is available
            window.postMessage('are-you-there', '*');

            setTimeout(function() {
                console.log('d3');

                if(DetectRTC.screen.chromeMediaSource == 'screen') {
                    callback(false);
                }
                else callback(true);
            }, 2000);
        },
        onMessageCallback: function(data) {
            console.log('d4');

            if (!(typeof data == 'string' || !!data.sourceId)) return;

            console.log('chrome message', data);


            ////////////////////////////////////////////////////////
            //
            //  "cancel" button is clicked
            //
            ////////////////////////////////////////////////////////
            if(data == 'PermissionDeniedError') {
                DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                if(screenCallback) return screenCallback('PermissionDeniedError');
                else throw new Error('PermissionDeniedError');
            }


            ////////////////////////////////////////////////////////
            //
            //  extension notified his presence
            //
            ////////////////////////////////////////////////////////
            if(data == 'dualrtc-extension') {
                if(document.getElementById('install-button')) {
                    document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/desktopCapture/mhpddeoilenchcefgimjlbbccdiepnnk" target="_blank">Google chrome extension</a> is installed.';
                }
                DetectRTC.screen.chromeMediaSource = 'desktop';
            }

            // extension shared temp sourceId
            if(data.sourceId) {
                DetectRTC.screen.sourceId = data.sourceId;
                if(screenCallback) screenCallback( DetectRTC.screen.sourceId );
            }
        },
        getChromeExtensionStatus: function (callback) {
            console.log('d5');

            if (!!navigator.mozGetUserMedia) return callback('not-chrome');
            else console.log('is-chrome');

            var extensionid = 'mhpddeoilenchcefgimjlbbccdiepnnk';
            var image = document.createElement('img');
            image.src = 'chrome-extension://' + extensionid + '/icon.png';
            image.onload = function () {
                console.log('d6');

                DetectRTC.screen.chromeMediaSource = 'screen';
                window.postMessage('are-you-there', '*');

                setTimeout(function () {
                    console.log('d7');

                    if (!DetectRTC.screen.notInstalled) {
                        callback('installed-enabled');
                    }
                }, 2000);
            };
            image.onerror = function () {
                console.log('d8');

                DetectRTC.screen.notInstalled = true;
                callback('not-installed');
            };
        }
    };

    // check if desktop-capture extension installed.
    if(window.postMessage && isChrome) {
        DetectRTC.screen.isChromeExtensionAvailable();
    }
})();


DetectRTC.screen.getChromeExtensionStatus(function(status) {
    console.log('d9');

    if(status == 'installed-enabled') {
        if(document.getElementById('install-button')) {
            //document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
        }
        DetectRTC.screen.chromeMediaSource = 'desktop';
    }
});



///////////////////////////////////////////////////////
//
//  Window Event Listener
//
////////////////////////////////////////////////////////
window.addEventListener('message', function (event) {
    console.log('d10');

    if (event.origin != window.location.origin) {
        return;
    }

    DetectRTC.screen.onMessageCallback(event.data);
});

console.log('current chromeMediaSource', DetectRTC.screen.chromeMediaSource);