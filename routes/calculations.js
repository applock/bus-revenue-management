require("dotenv").config();
const express = require("express");
const router = express.Router();
const GeoPoint = require("geopoint");
const fs = require("fs");
const fareConstant = process.env.FARE_CONSTANT;
const decimalPoints = parseInt(process.env.DECIMAL_POINTS);

router.get("/fare/:count/:fromLat/:fromLong/:toLat/:toLong", (req, resp) => {
  // #swagger.tags = ['Calculations']
  // #swagger.path = '/calc/fare/{passengerCount}/{LatitudeFrom}/{LongitudeFrom}/{LatitudeTo}/{LongitudeTo}'
  // #swagger.description = 'Calculations'

  var output = {};
  console.log("Distance in Kms - " + req.params.count);
  output.count = req.params.count;

  let point1 = new GeoPoint(
    parseFloat(req.params.fromLat),
    parseFloat(req.params.fromLong)
  );
  let point2 = new GeoPoint(
    parseFloat(req.params.toLat),
    parseFloat(req.params.toLong)
  );
  let distanceTravelledInKms = point1.distanceTo(point2, true);
  output.distance = distanceTravelledInKms;
  console.log("Distance in Kms - " + distanceTravelledInKms);

  let fare = distanceTravelledInKms * fareConstant;
  console.log("Individual fare - " + fare);
  output.fare = fare;

  let totalFare = fare * parseInt(req.params.count);
  console.log("Total fare - " + totalFare);
  output.totalFare = totalFare;
  output.unit = "INR";

  resp.send(output);
});

router.get("/earning/route/:routeCode/:date", (req, resp) => {
  // #swagger.tags = ['Calculations']
  // #swagger.path = '/calc/earning/route/{routeCode}/{date}'
  // #swagger.description = 'Calculations'

  var output = {};
  console.log(
    "Calulating earnings for Route Code - {} on date - {}",
    req.params.routeCode,
    req.params.date
  );
  output.routeCode = req.params.routeCode;
  output.date = req.params.date;
  let datafile = req.params.routeCode + "-" + req.params.date + ".json";

  let stopDetails = JSON.parse(fs.readFileSync("./static/" + datafile));
  if (stopDetails.hasOwnProperty("stops")) {
    let stopArr = stopDetails.stops.sort(
      (a, b) => parseFloat(a.sequence) - parseFloat(b.sequence)
    );
    console.log("Sorted stop count - `$stopArr.length`");

    let previousStop = stopArr[0];
    let countInsideBus = previousStop.in;
    let earning = 0.00;
    output.detailedEarning = [];

    for (let i = 1; i < stopArr.length; i++) {
      let currentStop = stopArr[i];
      let point1 = new GeoPoint(previousStop.latitude, previousStop.longitude);
      let point2 = new GeoPoint(currentStop.latitude, currentStop.longitude);
      let distanceTravelledInKms = point1.distanceTo(point2, true).toFixed(decimalPoints);
      let fare = distanceTravelledInKms * fareConstant;
      let hopEarning = parseFloat(fare * countInsideBus);
      output.detailedEarning.push({
        stretch: previousStop.stopName + "-" + currentStop.stopName,
        passengercount: countInsideBus,
        fare: fare.toFixed(decimalPoints),
        earning: hopEarning.toFixed(decimalPoints),
      });
      earning = parseFloat(earning) + parseFloat(hopEarning.toFixed(decimalPoints));
      countInsideBus = countInsideBus + currentStop.in - currentStop.out;
      previousStop = currentStop;
    }
    output.totalEarnings = earning.toFixed(decimalPoints);
  } else {
    resp.send(output);
  }
  output.unit = "INR";

  resp.send(output);
});

module.exports = router;
