function uuid() {
  var ID = function() {
    return Math.random().toString(16).slice(-4);
  };

  var UUID = ID() + ID() +"-"+ ID();

  return UUID;
};

chrome.app.runtime.onLaunched.addListener(function(LaunchData) {
  chrome.app.window.create("index.html", {
    "id": "piskel",
    "icon": "./lib/piskel/logo.png",
    "outerBounds": {
      "width": 900,
      "height": 600
    }
  },
  function(Win) {
    Win.contentWindow.onload = function() {
      var webview = Win.contentWindow.document.getElementById("piskel-webview");
    };
  });
});

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "id": "piskel:"+uuid(),
    "type": "normal",
    "title": "Open New Window",
    "contexts": ["launcher"]
  });
});

chrome.contextMenus.onClicked.addListener(function(Item) {
  var itemID = uuid();

  chrome.app.window.create("index.html", {
    "id": itemID,
    "outerBounds": {
      "width": 900,
      "height": 600
    }
  });
});
