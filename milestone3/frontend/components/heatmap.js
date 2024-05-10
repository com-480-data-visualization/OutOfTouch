export async function loadHeatMapData(resource) {
    return fetch(`http://localhost:5000/api/${resource}/coordinates?start_date=2019-01-01&end_date=2023-01-01`)
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


export async function loadHeatMap(data) {
    var mapCanvas = document.getElementById('map-canvas');

    var baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '...',
        maxZoom: 18
    });

    var cfg = {
        radius: 0.009,
        maxOpacity: .8,
        scaleRadius: true,
        useLocalExtrema: true,
        latField: 'lat',
        lngField: 'long',
        valueField: 'count'
    };


    // Define the range and initial values (as dates)
    var startDate = new Date("2019-01-01");
    var endDate = new Date("2023-01-01");
    var values = [startDate, endDate]; // Initial values

    // Select the start and end date spans
    const startDateSpan = document.getElementById('start-date');
    const endDateSpan = document.getElementById('end-date');

    // Update the start and end date spans with the initial values
    startDateSpan.textContent = startDate.toLocaleDateString();
    endDateSpan.textContent = endDate.toLocaleDateString();

    // Set up SVG dimensions
    var width = 700;
    var height = 50;
    var padding = 15;

    var heatmapLayer = new HeatmapOverlay(cfg);

    var map = new L.Map(mapCanvas, {
        center: new L.LatLng(40.7128, -74.0060),
        zoom: 10,
        layers: [baseLayer, heatmapLayer],
        gradient: { 0.4: 'blue', 0.65: 'green', 0.8: 'yellow', 0.95: 'orange', 1: 'red' }
    });

    L.control.scale({ imperial: true }).addTo(map);

    // Initialize resource select box
    var resourceSelect = document.getElementById('resource');
    resourceSelect.addEventListener('change', function () {
        var resource = this.value; // Get selected resource
        var startDate = values[0]
        var endDate = values[1]
        fetchDataAndUpdateHeatmap(startDate, endDate, resource);
    });

    // Fetch data and update heatmap
    async function fetchDataAndUpdateHeatmap(startDate, endDate, resource) {
        try {
            data = await loadHeatMapData(resource)
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        const filteredData = filterDataByDateRange(data, startDate, endDate)
        updateHeatmap(filteredData)
    }

    updateHeatmap(data);

    // Function to filter data by date range
    function filterDataByDateRange(data, startDate, endDate) {
        return {
            "data": data.data.filter(function (point) {
                var pointDate = new Date(point.date)
                return pointDate >= startDate && pointDate <= endDate
            })
        }
    }

    // Function to update heatmap data
    function updateHeatmap(data) {
        heatmapLayer.setData(data);
    }

    // Create SVG
    var svg = d3.select("#slider")
        .attr("width", width)
        .attr("height", height);

    // Set up scales for dates
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([padding, width - padding])
        .clamp(true);

    // Create slider track
    svg.append("line")
        .attr("class", "slider-segment slider-segment1")
        .attr("x1", padding)
        .attr("x2", x(values[0]))
        .attr("y1", height / 2)
        .attr("y2", height / 2);

    svg.append("line")
        .attr("class", "slider-segment slider-segment2")
        .attr("x1", x(values[0]))
        .attr("x2", x(values[1]))
        .attr("y1", height / 2)
        .attr("y2", height / 2);

    svg.append("line")
        .attr("class", "slider-segment slider-segment3")
        .attr("x1", x(values[1]))
        .attr("x2", width - padding)
        .attr("y1", height / 2)
        .attr("y2", height / 2);

    // Create handles
    var handles = svg.selectAll(".slider-handle")
        .data(values)
        .enter()
        .append("circle")
        .attr("class", "slider-handle")
        .attr("cx", function(d) { return x(d); })
        .attr("cy", height / 2)
        .attr("r", 10)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Drag functions
    function dragstarted(event, d) {
        d3.select(this).raise().classed("active", true);
    }

    function dragged(event, d, i) {
        const startDateSpan = document.getElementById('start-date');
        const endDateSpan = document.getElementById('end-date');

        var xValue = x.invert(event.x);
        xValue = new Date(Math.max(startDate.getTime(), Math.min(endDate.getTime(), xValue.getTime()))); // Clamp value within range
        if (d.getTime() == startDate.getTime()) {
            xValue = Math.min(xValue, values[1])
            values[0] = xValue
            const filteredData = filterDataByDateRange(data, values[0], values[1])
            updateHeatmap(filteredData)
        } else if (d.getTime() == endDate.getTime()) {
            xValue = Math.max(xValue, values[0])
            values[1] = xValue
            const filteredData = filterDataByDateRange(data, values[0], values[1])
            updateHeatmap(filteredData)
        }

        // Update the start and end date spans whenever the slider values change
        startDateSpan.textContent = new Date(values[0]).toLocaleDateString()
        endDateSpan.textContent = new Date(values[1]).toLocaleDateString()
   


        svg.selectAll(".slider-segment")
            .data([{
            x1: padding,
            x2: x(values[0])
            }, {
            x1: x(values[0]),
            x2: x(values[1])
            }, {
            x1: x(values[1]),
            x2: width - padding
            }])
            .attr("x1", d => d.x1)
            .attr("x2", d => d.x2);

        d3.select(this).attr("cx", x(xValue));
    }

    function dragended(event, d) {
        d3.select(this).classed("active", false);
    }
}


function drawWavyRoad(canvasId, roadWidth, numLanes, perspectiveFactor, amplitude, frequency) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');

    function drawRoad() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < numLanes; i++) {
            var laneOffset = i * (roadWidth / numLanes);
            var laneWidthAtDistance = (roadWidth / numLanes) + i * perspectiveFactor * (roadWidth / numLanes);
            
            ctx.beginPath();
            ctx.moveTo(0, canvas.height / 2);

            for (var x = 0; x <= canvas.width; x += 10) {
                var y = amplitude * Math.sin(x / frequency) + canvas.height / 2;
                ctx.lineTo(x, y);
            }

            ctx.lineTo(canvas.width, canvas.height);
            ctx.lineTo(0, canvas.height);
            ctx.closePath();
            
            ctx.fillStyle = 'gray';
            ctx.fill();
        }
    }

    drawRoad();
}

// Example usage:
drawWavyRoad('myCanvas', 300, 3, 0.1, 20, 100);





export async function initHeatMap() {
    
drawWavyRoad('roadCanvas', 300, 3, 0.1, 20, 100);

    try {
        const resourceOption = document.getElementById('resource')
        const dataHeatMap = await loadHeatMapData(`${resourceOption.value}`)
        loadHeatMap(dataHeatMap)
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener("DOMContentLoaded", initHeatMap);

