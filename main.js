require('leaflet');
require('proj4');
require('proj4leaflet');
require('./mmlLayers');
const GPS = require('gps');

var gps = new GPS();

async function sendGPSData() {
  if (document.getElementById("gps-file").files.length > 0) {
    console.log("Loading gps file");

    document.getElementById("gps-file").disabled = true;
    document.getElementById("open-button").disabled = true;

    document.getElementById("spinner").style.display = "block";
    const gpsFile = document.getElementById("gps-file").files[0];
    const gpsData = await gpsFile.text();
    gpsData.split("\n").map(value => {
      gps.update(value);
    });
    document.getElementById("spinner").style.display = "none";
    console.log("Loading complete");
  }
}

gps.on("data", function(parsed) {
  console.log(parsed);
});

document.getElementById("open-button").addEventListener("click", sendGPSData);

var map = new L.map("map", {
  crs: L.TileLayer.MML.get3067Proj()
}).setView([61, 25], 6);

L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(map);