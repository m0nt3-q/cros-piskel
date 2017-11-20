function uuid() {
  var _char = function() {
    return Math.random().toString(16).slice(-4);
  };

  var id = _char() + _char() +"-"+ _char();

  return id;
};

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("index.html", {
    "id": "piskel",
    "icon": "./piskel/logo.png",
    "outerBounds": {
      "width": 900,
      "height": 600
    }
  },
  function(Win) {
    Win.contentWindow.onload = function() {
      var webview = Win.contentWindow.document.getElementById("piskel-webview");
      webview.addEventListener("newwindow", function(Ev) {
        ////Ev.preventDefault();

        chrome.app.window.create("index.html", {
          "id": uuid(),
          "icon": "./piskel/logo.png",
          "outerBounds": {
            "width": 900,
            "height": 600
          }
        });

      });
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
