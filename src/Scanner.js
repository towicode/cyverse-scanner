import React, { Component } from 'react';
import Quagga from 'quagga';
import MobileDetect from 'mobile-detect';


class Scanner extends Component {

  secondsSinceEpoch = -1;
  first_found = -1;
  results = []
  results_check = []
  map = {}
  mode = "environment";



  componentDidMount() {

    this._startQuaggaHelper("environment");
    Quagga.onDetected(this._onDetected);

  }


  _startQuaggaHelper = (facingMode) => {
    var fixOrientation = function (w, h) {
      var md = new MobileDetect(window.navigator.userAgent), d = {
        w: w,
        h: h
      };

      if (md.phone() || md.tablet()) {
        if (window.matchMedia('(orientation:portrait)').matches) {
          if (md.userAgent() !== 'Safari') {
            d.w = h;
            d.h = w;
          }
        }
      }

      return d;
    }

    // ...

    var width = window.innerWidth
      || document.documentElement.clientWidth
      || document.body.clientWidth;

    var height = window.innerHeight
      || document.documentElement.clientHeight
      || document.body.clientHeight;

    var dim = fixOrientation(width, height);
    this.secondsSinceEpoch = Math.round(Date.now() / 1000) + 1;



    Quagga.init({
      inputStream: {
        type: "LiveStream",
        constraints: {
          width: dim.w,
          height: dim.h,
          facingMode: facingMode // or user
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true,
        debug: {
          showCanvas: true,
          showPatches: true,
          showFoundPatches: true,
          showSkeleton: true,
          showLabels: true,
          showPatchLabels: true,
          showRemainingPatchLabels: true,
          boxFromPatches: {
            showTransformed: true,
            showTransformedBox: true,
            showBB: true
          }
        }
      },
      numOfWorkers: 4,
      decoder: {
        readers: [
          "code_128_reader",
        ]
      },
      debug: {
        drawBoundingBox: true,
        showFrequency: true,
        drawScanline: true,
        showPattern: true
      },
      multiple: false,
      locate: true,
      debug: true
    }, function (err) {
      if (err) {
        return console.log(err);
      }
      Quagga.start();
    });
  }



  componentWillUnmount() {
    Quagga.offDetected(this._onDetected);
  }


  _switch = () => {

    if (this.mode === "environment") {
      Quagga.stop();
      this._startQuaggaHelper("user");
      this.mode = "user";
    }
    else if (this.mode === "user") {
      Quagga.stop();
      this._startQuaggaHelper("environment");
      this.mode = "environment"
    }
  }
  _scan = () => {
    this.props.cancel();
  }

  _onDetected = (result) => {

    const now = Math.round(Date.now() / 1000);

    var drawingCtx = Quagga.canvas.ctx.overlay,
      drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
      if (result.boxes) {
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
        result.boxes.filter(function (box) {
          return box !== result.box;
        }).forEach(function (box) {
          Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
        });
      }

      if (result.box) {
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
      }

      if (result.codeResult && result.codeResult.code) {
        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
      }

    }

    // Store the result in a hashmap along two 
    // parallel array so that we can verify the
    // code multiple times before we send it to the 
    // user.
    var code = String(result.codeResult.code);
    if (this.results_check.includes(code)) {
      var indx = this.results_check.indexOf(code)
      this.map[indx] = this.map[indx] + 1;
    } else {
      this.results.push(result);
      this.results_check.push(code);
      var indx = this.results.length - 1;
      this.map[indx] = 1;
    }

    // There is a small bug w/ android where the data
    // from the camera when you last used is avaliable
    // whenever you use it next. This is a simple fix
    // that forces the code to wait 1 second before 
    // actually returning.

    // This is not an efficent sleep and should
    // probably be replaced with a timeout
    // however it's working fine at the same time
    // its verifiying multiple times the actual code.
    if (this.first_found == -1) {
      this.first_found = now;
      return;
    }
    if (now <= this.first_found + 1) {
      return;
    }
    if (now <= this.secondsSinceEpoch) {
      return;
    }

    // Check and make sure we have over 10 hits of a result then
    // return it
    for (const property in this.map) {
      if (this.map[property] > 10) {

        var res = this.results[property];

        // This try block tries to extract an image out.
        try {
          var videos = document.getElementsByTagName("video");

          if (videos.length > 0) {
            var video = videos[0];

            const canvas = document.createElement("canvas");
            // scale the canvas accordingly
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // draw the video at that frame
            var ctx1 = canvas.getContext('2d');

            ctx1.drawImage(video, 0, 0, canvas.width, canvas.height);
            // convert it to a usable data URL
            const dataString = canvas.toDataURL();
            res.data1 = dataString;


            if (res.line.length >= 2) {
              var x1 = res.box[1][0];
              var y1 = res.box[1][1];
              var width = res.box[3][0] - x1;
              var height = res.box[3][1] - y1;
              //height = height + 200;

              var imageData = ctx1.getImageData(x1, y1, width, height);

              var canvas1 = document.createElement("canvas");
              canvas1.width = width;
              canvas1.height = height;
              var ctx2 = canvas1.getContext("2d");
              ctx2.rect(0, 0, 100, 100);
              ctx2.fillStyle = 'white';
              ctx2.fill();
              ctx2.putImageData(imageData, 0, 0);

              const dataString2 = canvas1.toDataURL();
              res.data2 = dataString2;

            }
          }
        } catch (err) {
          //pass
        }

        this.props.onDetected(res);
      }
    }
  }

  render() {
    return (
      <div>
        <div id="interactive" className="viewport" />
        <div>
          <div className="switch" onClick={this._switch}>
          </div>

          <div className="cancel" onClick={this._scan}>
          </div>
        </div>

        <div />
      </div>
    )
  }
}

export default Scanner
