var rtcmulticonnectionMessages = {
  'are-you-there': true,
  'get-sourceId':  true
};

var port = chrome.runtime.connect();

port.onMessage.addListener(function (message) {
  window.postMessage(message, '*');
});

window.addEventListener('message', function (event) {
  if (event.source != window)
    return;

  if(!rtcmulticonnectionMessages[event.data]) return;

  if(event.data == 'are-you-there') {
    return window.postMessage('dualrtc-extension', '*');
  }

  if(event.data == 'get-sourceId') {
    port.postMessage(event.data);
  }
});

window.postMessage('dualrtc-extension', '*');