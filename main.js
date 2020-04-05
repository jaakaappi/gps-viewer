require("leaflet");
require("proj4");
require("proj4leaflet");
require("./mmlLayers");
const GPS = require("gps");

let gps = new GPS();
let path = [];
let map,
  polyline = null;

const sendGPSData = async () => {
  let fileInput = $("#gps-file")[0];
  if (fileInput.files.length > 0) {
    console.log("Loading gps file");

    // let localStorage = Window.localStorage;
    localStorage.setItem("filename", fileInput.files[0].name);

    document.getElementById("gps-file").disabled = true;
    document.getElementById("open-button").disabled = true;
    const gpsFile = document.getElementById("gps-file").files[0];
    const gpsData = await gpsFile.text();

    if (document.getElementById("fix-checkbox").checked) {
      let rows = gpsData.split("\n");
      let messages = rows.map((row) => {
        let row_messages = row.split("$");
        row_messages = row_messages.filter(
          (message) => message !== "" && message !== " "
        );
        let fixed_messages = [];
        let residual_message = "";
        row_messages.forEach((element) => {
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

      messages.flat(Infinity).forEach((value) => {
        try {
          gps.update(value);
        } catch (e) {
          //console.warn(e);
        }
      });
    } else {
      gpsData.split("\n").map((value) => {
        try {
          if (value.length > 0) {
            gps.update(value);
          }
        } catch (e) {
          //console.warn(e);
        }
      });
    }

    let newPath = path.reduce((acc, curr) => {
      if (
        curr.lon > -16.1 &&
        curr.lon < 32.88 &&
        curr.lat > 40.18 &&
        curr.lat < 84.17
      ) {
        return acc.concat([[curr.lat, curr.lon]]);
      } else return acc;
    }, []);

    polyline = L.polyline(newPath, {
      color: "black",
      weight: 7.5,
    }).addTo(map);

    // sort paths by time
    const pathTimes = path.reduce(
      (minmax, current) => {
        if (current.time < minmax[0]) minmax[0] = current.time;
        if (current.time > minmax[1]) minmax[1] = current.time;
        return minmax;
      },
      [Infinity, 0]
    );

    const pointObjects = newPath.map((point) => {
      return { lat: point[0], lon: point[1] };
    });

    const distance = GPS.TotalDistance(pointObjects);

    const pathInfo = $("#path-info");
    pathInfo.html(
      `${pathTimes[0].toUTCString()} - ${pathTimes[1].toUTCString()}`
    );

    const infoRow = $("#info-row");
    infoRow.removeClass("d-none");

    const pathDistance = $("#path-distance");
    pathDistance.html(`${distance} kilometers`);

    map.fitBounds(polyline.getBounds());

    console.log("Loading complete");
  }
};

const clearData = () => {
  path = [];
  document.getElementById("gps-file").disabled = false;
  document.getElementById("open-button").disabled = false;

  const pathInfo = $("#path-info");
  pathInfo.html("");
  const pathDistance = $("#path-distance");
  pathDistance.html("");
  const infoRow = $("#info-row");
  infoRow.addClass("d-none");

  map.removeLayer(polyline);
  map.setView([61, 25], 4);
};

$(document).ready(() => {
  if ($("#gps-file")[0].files.length > 0) {
    let filename = localStorage.getItem("filename");
    if (filename === null) filename = "Choose a file";
    $("#file-label").html(filename);
  }

  document.getElementById("open-button").addEventListener("click", sendGPSData);
  $("#delete-button").on("click", clearData);

  map = new L.map("map", {
    crs: L.TileLayer.MML.get3067Proj(),
  }).setView([61, 25], 4);

  L.tileLayer.mml_wmts({ layer: "maastokartta", opacity: 0.8 }).addTo(map);

  gps.on("data", function (parsed) {
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
    .addEventListener("change", function (e) {
      var fileName = document.getElementById("gps-file").files[0].name;
      var nextSibling = e.target.nextElementSibling;
      nextSibling.innerText = fileName;
    });
});
