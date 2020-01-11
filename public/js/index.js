function sendGPSData() {
  console.log("Loading gps file");

  document.getElementById("gps-file").disabled = true;
  document.getElementById("open-button").disabled = true;

  document.getElementById("spinner").style.display = "block";
  let gpsData = document.getElementById("gps-file").files[0];
}
document.getElementById("open-button").addEventListener("click", sendGPSData);