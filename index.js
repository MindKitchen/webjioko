"use strict";

var serialport = require("serialport"),
  SerialPort = serialport.SerialPort,
  request = require("request");

// Settings
var port = "COM9",
  full = {
    w: 1920,
    h: 1080
  },
  actual = {
    //w: 10.6667,
    //h: 6
    w: 16,
    h: 9
  };

function sendG(port, g) {
  // Print G code to stdout and fire it off to the GRBL
  process.stdout.write("Sending: " + g + " - ");
  port.write(g + "\n");
}

function printGRBLOutput(data) {
  process.stdout.write(data + "\n");
};

function scalePosition(position, fullSize, actualSize) {
  // Temporary position correction to deal with Planchette offset
  position.x += 100;
  position.y += 122;

  return {
    x: position.x / (fullSize.w / actualSize.w),
    y: position.y / (fullSize.h / actualSize.h),
  };
};

function movePlanchette() {
  var pos = {};

  request("http://webji.mndktchn.com/pos", function(err, res, body) {
    if (body !== undefined) {
      pos = scalePosition(JSON.parse(body), full, actual);
      sendG(grbl, "G90 G0 F200 X" + pos.x + "Y" + pos.y);
    }
  });
}

// Make it happen!
var grbl = new SerialPort(port, {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

grbl.on("data", printGRBLOutput);

setInterval(movePlanchette, 1000);
