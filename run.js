function uuid() {
  var _char = function() {
    return Math.random().toString(16).slice(-4);
  };

  var id = _char() + _char() +"-"+ _char();

  return id;
};

piskel = [];

document.onreadystatechange = function() { if(document.readyState == 'complete') {
  var webview = document.createElement("webview");
  var dialog = document.getElementById("dialog-div");
  dialog.prompt_ = dialog.children[0];
  dialog.input_ = dialog.children[1];

  webview.id = "piskel-webview";
  webview.src = "piskel/index.html";
  webview.partition = "persist:static";


  webview.setZoom(8/10, function() {});

  webview.addEventListener("dialog", function(Ev) {
    if(Ev.messageType == "confirm") {
      Ev.dialog.ok("");
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

    Ev.dialog.cancel();
  });

  webview.addEventListener("permissionrequest", function(Ev) {
    if(Ev.permission === "download") {
      Ev.request.allow();
    }
  });

  piskel.push(document.body.appendChild(webview));
} }
