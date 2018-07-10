function uuid() {
  var ID = function() {
    return Math.random().toString(16).slice(-4);
  };

  var UUID = ID() + ID() +"-"+ ID();

  return UUID;
};

piskel = [];

var zoom = document.getElementById("zoom");
var zoomCurr = 10;
var zoomRatio = zoomCurr/10;


zoom.children[0].addEventListener("click", function(Ev) {
  if(zoomCurr > 0) {
    zoomCurr -= 1;
    zoomRatio = zoomCurr/10;
  }

  zoom.children[2].children[0].innerText = (zoomRatio * 100) + "%";

  chrome.storage.local.set({ zoom: zoomRatio }, function() {});
  piskel[0].setZoom(zoomRatio);
});

zoom.children[1].addEventListener("click", function(Ev) {
  if(zoomCurr <= 9) {
    zoomCurr += 1;
    zoomRatio = zoomCurr/10;
  }

  zoom.children[2].children[0].innerText = (zoomRatio * 100) + "%";

  chrome.storage.local.set({ zoom: zoomRatio }, function() {});
  piskel[0].setZoom(zoomRatio);
});


/*
 *
 */


document.onreadystatechange = function() { if(document.readyState == 'complete') {
  var webview = document.createElement("webview");
  var dialog = document.getElementById("dialog-div");
  dialog.prompt_ = dialog.children[0];
  dialog.input_ = dialog.children[1];

  webview.id = "piskel-webview";
  webview.src = "lib/piskel/index.html";
  webview.partition = "persist:static";

  chrome.storage.local.get("zoom", function(Items) {
    if(typeof Items.zoom != 'undefined') {
      zoomRatio = Items.zoom;

      if(typeof zoomRatio != 'undefined' && zoomRatio != 1) {
        zoomCurr = zoomRatio * 10;
      }

      zoom.children[2].children[0].innerText = (zoomRatio * 100) + "%";
      webview.setZoom(zoomRatio);
    }
    else {
      chrome.storage.local.set({ zoom: zoomRatio }, function() {});
    }
  });

  webview.ondialog = function(Ev) {
    if(Ev.messageType == "confirm") {
      Ev.dialog.ok("");
      return;
    }
    if(Ev.messageType == "prompt") {
      dialog.style.display = "block";
      dialog.prompt_.innerText = Ev.messageText;
      dialog.input_.value = "";
      dialog.input_.focus();

      dialog.input_.addEventListener("keydown", function(Eve) {
        if(Eve.keyCode == 13) {
          dialog.children[2].click();
        }
      });
      dialog.children[2].addEventListener("click", function(Eve) {
        dialog.style.display = "none";
  
        if(dialog.prompt_.innerText == "Please enter the layer name") {
          webview.executeScript({ code: ""+
            "var script = document.createElement('script');"+
            "script.textContent = `"+
              "(function() {"+
                "var input = '"+ dialog.input_.value + "';"+
                "console.log(input);"+
                "var index = pskl.app.piskelController.getCurrentLayerIndex();"+
                "pskl.app.piskelController.renameLayerAt(index, input);"+
                "pskl.app.layersListController.renderLayerList_();"+
              "})();"+
            "`;"+
            "document.documentElement.appendChild(script);"+
            "script.remove();"
          });

          webview.focus();
        }
        if(dialog.prompt_.innerText == "Set layer opacity (value between 0 and 1)") {
          webview.executeScript({ code: ""+
            "var script = document.createElement('script');"+
            "script.textContent = `"+
              "(function() {"+
                "var input = '"+ dialog.input_.value + "';"+
                "var index = pskl.app.piskelController.getCurrentLayerIndex();"+
                "pskl.app.piskelController.setLayerOpacityAt(index, input);"+
              "})()"+
            "`;"+
            "document.documentElement.appendChild(script);"+
            "script.remove();"
          });

          webview.focus();
        }
      });
      dialog.children[3].addEventListener("click", function(Eve) {
        dialog.style.display = "none";
        webview.focus();
      });
    }
  };

  webview.onpermissionrequest = function(Ev) {
    if(Ev.permission === "download") {
      Ev.request.allow();
    }
  };

  webview.onnewwindow = function(Ev) {
  };

  webview.onloadabort = function(Ev) {
  };

  webview.onloadstart = function(Ev) {
    if(Ev.url == "about:blank") {
      console.log("trying to go to about:blank");
      return false;
    }
  };
  webview.onloadstop = function(Ev) {
    webview.contentWindow.postMessage("hi", webview.thisURL+"/lib/piskel/index.html");//);
  };

  webview.onloadredirect = function(Ev) {
  };

  webview.onexit = function(Ev) {
  };

  webview.thisURL = "chrome-extension://"+chrome.runtime.id;
  addEventListener("message", function(Ev) {
    chrome.fileSystem.chooseEntry({ type: "saveFile", suggestedName: Ev.data[1] }, function(WriteEntry) {
      WriteEntry.createWriter(function(FileWriter) {
        FileWriter.write(new Blob([Ev.data[0]], {type: "application/json"}));
      });
    });
  });

  piskel.push(document.body.appendChild(webview));
} }
