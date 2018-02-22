(function () {
  var ns = $.namespace('pskl.utils');

  ns.GLUtils = {
    fsh:
     "precision mediump float;"+
     "uniform vec4 color; uniform sampler2D samplerImage;"+
     "varying vec2 textureCVary;"+
     "void main() {"+
     //"  gl_FragColor = color;"+
     "  gl_FragColor = texture2D(samplerImage, textureCVary);"+
     "}",
    vsh:
     "attribute vec2 vertexPosition; attribute vec2 textureCAttr;"+
     "uniform vec2 resolution;"+
     "varying vec2 textureCVary"+
     "void main() {"+
     "  vec2 zeroToOne = vertexPosition / resolution;"+
     "  vec2 zeroToTwo = zeroToOne * 2.0;"+
     "  vec clipSpace = zeroToTwo - 1.0;"+
     "  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);"+
     "  textureCVary = textureCAttr;"+
     "}",
    createCanvas : function (width, height, classList) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);

      if (typeof classList == 'string') {
        classList = [classList];
      }
      if (Array.isArray(classList)) {
        for (var i = 0 ; i < classList.length ; i++) {
          canvas.classList.add(classList[i]);
        }
      }

      return canvas;
    },

    init : function(canvas, gl) {
      canvas.p = gl.createProgram();
      canvas.fsh = gl.createShader(gl.FRAGMENT_SHADER);
      canvas.vsh = gl.createShader(gl.VERTEX_SHADER);

      gl.shaderSource(canvas.fsh, pskl.utils.GLUtils.fsh);
      gl.shaderSource(canvas.vsh, pskl.utils.GLUtils.vsh);

      gl.compileShader(canvas.fsh);
      gl.compileShader(canvas.vsh);

      gl.attachShader(canvas.p, canvas.fsh);
      gl.attachShader(canvas.p, canvas.vsh);
      gl.linkProgram(canvas.p);
      gl.useProgram(canvas.p);

      canvas.p.vertexPosition = gl.getAttribLocation(canvas.p, "vertexPosition");
      canvas.p.textureCAttr = gl.getAttribLocation(canvas.p, "textureCAttr");

      canvas.p.resolution = gl.getUniformLocation(canvas.p, "resolution");
      canvas.p.samplerImage = gl.getUniformLocation(canvas.p, "samplerImage");
    },

    createFromImageData : function (imageData) {
      var canvas = pskl.utils.GLUtils.createCanvas(imageData.width, imageData.height);
      var context = canvas.getContext('webgl');
      pskl.utils.GLUtils.init(canvas, context);
      //context.putImageData(imageData, 0, 0);
      return canvas;
    },

    createFromImage : function (image) {
      var canvas = pskl.utils.GLUtils.createCanvas(image.width, image.height);
      var context = canvas.getContext('webgl');
      //context.drawImage(image, 0, 0);
      return canvas;
    },

    /**
     * Splits the specified image into several new canvas elements based on the
     * supplied offset and frame sizes
     * @param image The source image that will be split
     * @param {Number} offsetX The padding from the left side of the source image
     * @param {Number} offsetY The padding from the top side of the source image
     * @param {Number} width The width of an individual frame
     * @param {Number} height The height of an individual frame
     * @param {Boolean} useHorizonalStrips True if the frames should be layed out from left to
     * right, False if it should use top to bottom
     * @param {Boolean} ignoreEmptyFrames True to ignore empty frames, false to keep them
     * @returns {Array} An array of canvas elements that contain the split frames
     */
    createFramesFromImage : function (image, offsetX, offsetY, width, height, useHorizonalStrips, ignoreEmptyFrames) {
      var canvasArray = [];
      var x = offsetX;
      var y = offsetY;
      var blankData = pskl.utils.GLUtils.createCanvas(width, height).toDataURL();

      while (x + width <= image.width && y + height <= image.height) {
        // Create a new canvas element
        var canvas = pskl.utils.GLUtils.createCanvas(width, height);
        var context = canvas.getContext('2d');

        // Blit the correct part of the source image into the new canvas
        context.drawImage(
          image,
          x,
          y,
          width,
          height,
          0,
          0,
          width,
          height);

        if (!ignoreEmptyFrames || canvas.toDataURL() !== blankData) {
          canvasArray.push(canvas);
        }

        if (useHorizonalStrips) {
          // Move from left to right
          x += width;
          if (x + width > image.width) {
            x = offsetX;
            y += height;
          }
        } else {
          // Move from top to bottom
          y += height;
          if (y + height > image.height) {
            x += width;
            y = offsetY;
          }
        }
      }

      return canvasArray;
    },

    /**
     * By default, all scaling operations on a Canvas 2D Context are performed using antialiasing.
     * Resizing a 32x32 image to 320x320 will lead to a blurry output.
     * On Chrome, FF and IE>=11, this can be disabled by setting a property on the Canvas 2D Context.
     * In this case the browser will use a nearest-neighbor scaling.
     * @param  {Canvas} canvas
     */
    disableImageSmoothing : function (canvas) {
      pskl.utils.GLUtils.setImageSmoothing(canvas, false);
    },

    enableImageSmoothing : function (canvas) {
      pskl.utils.GLUtils.setImageSmoothing(canvas, true);
    },

    setImageSmoothing : function (canvas, smoothing) {
      var context = canvas.getContext('2d');
      context.imageSmoothingEnabled = smoothing;
      context.mozImageSmoothingEnabled = smoothing;
      context.oImageSmoothingEnabled = smoothing;
      context.webkitImageSmoothingEnabled = smoothing;
      context.msImageSmoothingEnabled = smoothing;
    },

    clear : function (canvas) {
      if (canvas) {
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
    },

    clone : function (canvas) {
      var clone = pskl.utils.GLUtils.createCanvas(canvas.width, canvas.height);

      //apply the old canvas to the new one
      clone.getContext('2d').drawImage(canvas, 0, 0);

      //return the new canvas
      return clone;
    },

    getImageDataFromCanvas : function (canvas) {
      //var sourceContext = canvas.getContext('2d');
      var sourceContext = canvas.getContext('webgl');
      //return sourceContext.getImageData(0, 0, canvas.width, canvas.height).data;
      //return sourceContext.getImageData(0, 0, canvas.width, canvas.height).data;
    },

    getBase64FromCanvas : function (canvas, format) {
      format = format || 'png';
      var data = canvas.toDataURL('image/' + format);
      return data.substr(data.indexOf(',') + 1);
    }
  };
})();
