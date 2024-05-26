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

export async function loadDataAndDraw(matrix, zones, chordElementId) {
    const width = 600;
    const height = 700;
    const innerRadius = Math.min(width, height) * 0.4 - 100;
    const outerRadius = innerRadius + 10;

    const chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
        .radius(innerRadius);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    function drawChordDiagram(matrix, zones, elementId) {
        const svg = d3.select(`#${elementId}`)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const chords = chord(matrix);

        // Add the groups
        const group = svg.append("g")
        .selectAll("g")
        .data(chords.groups)
        .enter().append("g");

        group.append("path")
        .style("fill", d => color(d.index))
        .style("stroke", d => d3.rgb(color(d.index)).darker())
        .attr("d", arc);

        // Add the labels
        group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", d => `
            rotate(${d.angle * 180 / Math.PI - 90})
            translate(${outerRadius + 5})
            ${d.angle > Math.PI ? "rotate(180)" : ""}
        `)
        .style("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .style("fill", "white")
        .text(d => zones[d.index]);

        // Add the ribbons
        svg.append("g")
        .selectAll("path")
        .data(chords)
        .enter().append("path")
        .attr("d", ribbon)
        .style("fill", d => color(d.target.index))
        .style("stroke", d => d3.rgb(color(d.target.index)).darker());
    }

    drawChordDiagram(matrix, zones, chordElementId);
   
}

async function loadData() {
    return fetch(`http://localhost:5000/api/routes`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const result = {
                "data" : data
            }
            return result
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            throw error
        });
}

async function init() {
    const data = await loadData();

    loadDataAndDraw(data.data['pre_pandemic_matrix'], data.data['pre_pandemic_zones'], 'pre-pandemic-chord');
    loadDataAndDraw(data.data['pandemic_matrix'], data.data['pandemic_zones'], 'pandemic-chord');
    loadDataAndDraw(data.data['post_pandemic_matrix'], data.data['post_pandemic_zones'], 'post-pandemic-chord');
    drawZones()
}

window.onload = init;