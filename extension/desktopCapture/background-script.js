var session = ['screen', 'window'];

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(portOnMessageHanlder);

  function portOnMessageHanlder(message) {
    if(message == 'get-sourceId') {
      chrome.desktopCapture.chooseDesktopMedia(session, port.sender.tab, onAccessApproved);
    }
  }

  function onAccessApproved(sourceId) {
    console.log('sourceId', sourceId);
    if(!sourceId || !sourceId.length) {
      return port.postMessage('PermissionDeniedError');
    }

    port.postMessage({
      sourceId: sourceId
    });
  }
});