export async function drawZones() {
    var zoneMap = document.getElementById('zoneMap');

    // Add base tile layer
    var baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '...',
        maxZoom: 18
    });

    var map = new L.Map(zoneMap, {
        center: new L.LatLng(40.7128, -74.0060),
        zoom: 10,
        layers: [baseLayer]
    });

    // Load GeoJSON data for the zones
    fetch('./assets/data/zones.geojson')
    .then(response => response.json())
    .then(data => {
        // Extract the geometries, zones, and boroughs from each feature
        const featuresWithProperties = data.features.map(feature => {
            return {
                type: 'Feature',
                geometry: feature.geometry,
                properties: {
                    zone: feature.properties.zone,
                    borough: feature.properties.borough
                }
            };
        });

        // Create a new GeoJSON object with features containing geometry, zone, and borough
        const zonesGeoJSON = {
            type: 'FeatureCollection',
            features: featuresWithProperties
        };

        // Add GeoJSON layer representing the zones to the map
        L.geoJSON(zonesGeoJSON, {
            style: {
                color: '#777', // Gray border color
                fillColor: '#ccc', // Light gray fill color
                fillOpacity: 0.6, // Fill opacity (0 is fully transparent, 1 is fully opaque)
                weight: 2 // Border width
            },
            onEachFeature: function (feature, layer) {
                // Define the content for the popup
                var popupContent = `<b>Zone:</b> ${feature.properties.zone}<br><b>Borough:</b> ${feature.properties.borough}`;
                // Bind the popup to the layer
                layer.bindPopup(popupContent);
                
                // Show popup on mouseover
                layer.on('mouseover', function (e) {
                    this.openPopup();
                });
                
                // Close popup on mouseout
                layer.on('mouseout', function (e) {
                    this.closePopup();
                });
            }
        }).addTo(map);

    })
    .catch(error => {
        console.error('Error loading GeoJSON data:', error);
    });
}

window.onload = drawZones;