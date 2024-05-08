function init() {
  var map = L.map('map').setView([40.7128, -74.006], 11); // New York City coordinates

  // Add a base tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  var marker; // Variable to store the currently active marker

  map.on('click', function (e) {
    // Remove the previously added marker, if any
    if (marker) {
      map.removeLayer(marker);
    }
    // Add a marker at the clicked point
    marker = L.marker(e.latlng).addTo(map);
    var lat = e.latlng.lat.toFixed(6);
    var lng = e.latlng.lng.toFixed(6);
    // Update the prediction box with the selected coordinates
    document.getElementById(
      'coordinates'
    ).innerText = `Latitude: ${lat}, Longitude: ${lng}`;
    // Here you can generate a prediction based on the selected point
    // For demonstration purposes, let's generate a random prediction
    var prediction = Math.random() < 0.5 ? 'Low' : 'High';
    document.getElementById(
      'prediction'
    ).innerText = `Accident prediction: ${prediction}`;
  });
}

window.onload = init;
