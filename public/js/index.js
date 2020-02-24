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

// var map;

// var mapOptions = {
//   target: "map",
//   projection: new ol.proj.Projection("EPSG:3067"),
//   resolutions: [
//     8192.0,
//     4096.0,
//     2048.0,
//     1024.0,
//     512.0,
//     256.0,
//     128.0,
//     64.0,
//     32.0,
//     16.0,
//     8.0,
//     4.0,
//     2.0,
//     1.0,
//     0.5,
//     0.25
//   ],
//   units: "m",
//   view: new ol.View({
//     extent: [-548576.0, 6291456.0, 1548576.0, 8388608.0],
//     zoom: 5
//   }),
//   layers: [
//     new ol.layer.Tile({
//       source: new ol.source.WMTS({
//         name: "WMTS kiinteistojaotus",
//         url: "https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts",
//         layer: "maastokartta",
//         matrixSet: "epsg3067",
//         format: "png",
//         isBaseLayer: true,
//         style: "default",
//         requestEncoding: "REST"
//       })
//     })
//   ]
// };

// map = new ol.Map("map", mapOptions);

// const parser = new ol.format.WMTSCapabilities();

// fetch(
//   "https://avoin-karttakuva.maanmittauslaitos.fi/avoin/wmts/1.0.0/WMTSCapabilities.xml"
// )
//   .then(function(response) {
//     return response.text();
//   })
//   .then(function(text) {
//     var result = parser.read(text);
//     console.log(result);
//     var options = ol.source.WMTS.optionsFromCapabilities(result, {
//       layer: "maastokartta",
//       projection: "EPSG:3067",
//       matrixSet: "ETRS-TM35FIN"
//     });

//     var map = new ol.Map({
//       controls: ol.control.defaults().extend([new ol.control.MousePosition()]),
//       target: "map",
//       view: new View({
//         center: [19412406.33, -5050500.21],
//         zoom: 5
//       }),
//       layers: [
//         new ol.layer.Tile({
//           opacity: 0.7,
//           source: new ol.source.OSM()
//         }),
//         ,
//         new ol.layer.Tile({
//           opacity: 1,
//           source: new ol.source.WMTS(options)
//         })
//       ]
//     });
//   });
