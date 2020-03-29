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
    const gpsFile = document.getElementById("gps-file").files[0];
    const gpsData = await gpsFile.text();

    if (document.getElementById("fix-checkbox").checked) {
      let rows = gpsData.split("\n");
      let messages = rows.map(row => {
        let row_messages = row.split("$");
        row_messages = row_messages.filter(
          message => message !== "" && message !== " "
        );
        let fixed_messages = [];
        let residual_message = "";
        row_messages.forEach(element => {
          const prefix = element.substring(0, 2);
          let message = element;
          if (prefix === "GP" || prefix === "GN") {
            // fix split messages
            if (residual_message !== "") {
              message += residual_message;
              residual_message = "";
            }
            message = "$" + message;

            // remove A-prefix from some checksums
            const checksum_index = message.indexOf("*");
            if (checksum_index != -1 && message[checksum_index - 1] === "A") {
              message =
                message.slice(0, checksum_index - 1) +
                message.slice(checksum_index);
            }

            // insert missing checksum asterisk as gpsjs seems to require it for some messages
            fields = message.split(",");
            fields[fields.length - 1] = "*";
            message = fields.join(",");

            fixed_messages.push(message);
          } else {
            residual_message = element;
          }
        });
        return fixed_messages;
      });

      messages.flat(Infinity).forEach(value => {
        try {
          gps.update(value);
        } catch (e) {
          console.warn(e);
        }
      });
    } else {
      gpsData.split("\n").map(value => {
        try {
          if (value.length > 0) {
            gps.update(value);
          }
        } catch (e) {
          //console.warn(e);
        }
      });
    }

    // sort paths by time
    path.sort((a, b) => {
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      return 0;
    });

    var polyline = L.polyline(
      path.map(point => {
        return [point.lat, point.lon];
      }),
      {
        color: "#2f7d5a",
        weight: 4,
        dashArray: "10,10"
      }
    ).addTo(map);

    map.fitBounds(polyline.getBounds());

    const pathList = document.querySelector("#path-list");
    let pathListNode = document.createElement("li");
    pathListNode.innerHTML = path[0].time;
    pathList.appendChild(pathListNode);

    console.log("Loading complete");
  }
}

document.getElementById("open-button").addEventListener("click", sendGPSData);

var map = new L.map("map", {
  crs: L.TileLayer.MML.get3067Proj()
}).setView([61, 25], 4);

L.tileLayer.mml_wmts({ layer: "maastokartta" }).addTo(map);

gps.on("data", function(parsed) {
  if (
    ["GGA", "RMC", "GLL"].includes(parsed.type) &&
    parsed.lat != null &&
    parsed.lon != null &&
    parsed.lat !== 0 &&
    parsed.lon !== 0 &&
    parsed.time !== null
  ) {
    path.push({ time: parsed.time, lat: parsed.lat, lon: parsed.lon });
  }
});

document
  .querySelector(".custom-file-input")
  .addEventListener("change", function(e) {
    var fileName = document.getElementById("gps-file").files[0].name;
    var nextSibling = e.target.nextElementSibling;
    nextSibling.innerText = fileName;
  });
