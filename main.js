require("leaflet");
require("proj4");
require("proj4leaflet");
require("./mmlLayers");
const GPS = require("gps");

var gps = new GPS();
var path = [];

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
    var polyline = L.polyline(path, {
      color: "#083600",
      weight: 4,
      dashArray: "10,10"
    }).addTo(map);

    map.fitBounds(polyline.getBounds());

    document.getElementById("spinner").style.display = "none";
    console.log("Loading complete");
  }
}

document.getElementById("open-button").addEventListener("click", sendGPSData);

var map = new L.map("map", {
  crs: L.TileLayer.MML.get3067Proj()
}).setView([61, 25], 4);

L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(map);

gps.on("data", function(parsed) {
  if (["GGA", "RMC", "GLL"].includes(parsed.type)) {
    console.log(parsed.lat, parsed.lon);
    path.push([parsed.lat, parsed.lon]);
  }
});
