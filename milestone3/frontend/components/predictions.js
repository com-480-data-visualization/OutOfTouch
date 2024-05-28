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

  let selectedTime;

  document.getElementById('time').addEventListener('input', (e) => {
    selectedTime = e.target.value;
    console.log("AM SECLECTAT TIMPUL")
    console.log(selectedTime)
  });

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

      if (selectedTime) {
        // Make a POST request to the Flask server
        const data = {
          latitude: parseFloat(lng),
          longitude: parseFloat(lat),
          time: selectedTime
        };
        console.log(data)
        fetch('http://localhost:5000/api/predict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
              console.log("AM aici predictia")
              console.log(result)
              if (result.error) {
                document.getElementById('prediction').innerText = `Error: ${result.error}`;
              } else {
                const probability = result;
                let riskLevel = '';
                let color = result;
                if (color === 'red'){
                  riskLevel = 'High';
                }else if (color === 'orange'){
                  riskLevel = 'Medium'
                }else{
                  riskLevel = 'Low';
                }

                document.getElementById('prediction').innerHTML = `Accident prediction: <span style="color:${color}">${riskLevel} risk </span>`;
              }
            })
            .catch(error => {
              document.getElementById('prediction').innerText = `Error: ${error.message}`;
            });
      } else {
        document.getElementById('prediction').innerText = 'Please select a time.';
      }
    } else {
      // If the point is outside the polygon, do not place a marker
      document.getElementById('coordinates').innerText = `Latitude: , Longitude: `;
      document.getElementById('prediction').innerText = `Accident prediction: `;
    }
  });
}

window.onload = init;