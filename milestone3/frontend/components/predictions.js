function init() {
  var map = L.map('map').setView([40.7128, -74.006], 11); // New York City coordinates

  // Add a base tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  var marker; // Variable to store the currently active marker
  var polygonLayer; // Variable to store the GeoJSON layer

  // Load the GeoJSON file and add it to the map
  var geojsonLayer = new L.GeoJSON.AJAX('../assets/data/NYC_zone.geojson', {
    onEachFeature: function (feature, layer) {
      polygonLayer = layer; // Store the layer for later use
    }
  }).addTo(map);

  map.on('click', function (e) {
    // Remove the previously added marker, if any
    if (marker) {
      map.removeLayer(marker);
    }

    var latlng = e.latlng;
    var point = turf.point([latlng.lng, latlng.lat]); // Create a Turf.js point

    // Check if the point is within the polygon
    var isWithin = false;
    geojsonLayer.eachLayer(function (layer) {
      if (turf.booleanPointInPolygon(point, layer.feature.geometry)) {
        isWithin = true;
      }
    });

    if (isWithin) {
      // Add a marker at the clicked point
      marker = L.marker(e.latlng).addTo(map);
      var lat = e.latlng.lat.toFixed(6);
      var lng = e.latlng.lng.toFixed(6);
      // Update the prediction box with the selected coordinates
      document.getElementById('coordinates').innerText = `Latitude: ${lat}, Longitude: ${lng}`;
      // Generate a prediction based on the selected point
      var prediction = Math.random() < 0.5 ? 'Low' : 'High';
      document.getElementById('prediction').innerText = `Accident prediction: ${prediction}`;
    } else {
      // If the point is outside the polygon, do not place a marker
      document.getElementById('coordinates').innerText = `Latitude: , Longitude: `;
      document.getElementById('prediction').innerText = `Accident prediction: `;
    }
  });
}

window.onload = init;
