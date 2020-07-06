import React, { Component } from 'react';
import Quagga from 'quagga';
import MobileDetect from 'mobile-detect';


class Scanner extends Component {



  componentDidMount() {

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



    Quagga.init({
      inputStream: {
        type: "LiveStream",
        constraints: {
          width: dim.w,
          height: dim.h,
          facingMode: "environment" // or user
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
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
    Quagga.onDetected(this._onDetected);

  }



  componentWillUnmount() {
    Quagga.offDetected(this._onDetected);
  }

  _onDetected = (result) => {

    // var delay = (function () {
    //   var timer = 0;
    //   return function (callback, ms) {
    //     clearTimeout(timer);
    //     timer = setTimeout(callback, ms);
    //   };
    // })();


    // var drawingCtx = Quagga.canvas.ctx.overlay,
    //   drawingCanvas = Quagga.canvas.dom.overlay;

    // if (result) {
    //   if (result.boxes) {
    //     drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
    //     result.boxes.filter(function (box) {
    //       return box !== result.box;
    //     }).forEach(function (box) {
    //       Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
    //     });
    //   }

    //   if (result.box) {
    //     Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
    //   }

    //   if (result.codeResult && result.codeResult.code) {
    //     Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
    //   }
    // } 

    this.props.onDetected(result);

  }

  render() {
    return (
      <div id="interactive" className="viewport" />
    )
  }
}

export default Scanner
