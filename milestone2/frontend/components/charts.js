import { loadHeatMapData } from "./load.js";

export async function loadTimeSeriesChart(ctx, dates, counts) {
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Occurrences',
                data: counts,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

export async function loadRaceChart(datax){

    // Convert 'date' to d3 time format
    const data = datax.data.map(d => {
        return {
            date: d3.timeParse("%Y-%m")(d.date),
            name: d.name,
            value: d.value
        }
    })

    const svg = d3.select('#bar-chart-race');
    svg.attr('viewBox', [0, 0, 1000, 600]);

    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const width = 1000 - margin.left - margin.right;

    const n = 10;
    const k = 10;
    const barSize = 48;
    const duration = 160;

    const x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
    const y = d3.scaleBand()
        .domain(d3.range(n+1))
        .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
        .padding(0.1);

    const datevalues = Array.from(d3.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
        .map(([date, data]) => [new Date(date), data])
        .sort(([a], [b]) => d3.ascending(a, b));
    const names = new Set(data.map(d => d.name));

    const formatNumber = d3.format(',d');
    const formatDate = d3.utcFormat("%Y")

    function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
    }

    const keyframes = [];
    let ka, a, kb, b;
    for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
            const t = i / k;
            keyframes.push([
                new Date(ka * (1 - t) + kb * t),
                rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
            ]);
        }
    }
    keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);

    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);
    const prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
    const next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)))

    const updateBars = bars(svg);
    const updateAxis = axis(svg);
    const updateLabels = labels(svg);
    const updateTicker = ticker(svg);

    const color = (data) => {
        const scale = d3.scaleOrdinal(d3.schemeTableau10);
        //     const categoryByName = new Map(data.map(d => [d.name, d.category]));
        //     scale.domain(Array.from(categoryByName.values()));
        //     return d => scale(categoryByName.get(d.name));
        return d => scale(d.name);
    }

    function bars(svg) {
        let bar = svg.append('g')
            .attr('fill-opacity', 0.6)
            .selectAll('rect');

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
                enter => enter.append("rect")
                    .attr("fill", color)
                    .attr("height", y.bandwidth())
                    .attr("x", x(0))
                    .attr("y", d => y((prev.get(d) || d).rank))
                    .attr("width", d => x((prev.get(d) || d).value) - x(0)),
                update => update,
                exit => exit.transition(transition).remove()
                    .attr("y", d => y((next.get(d) || d).rank))
                    .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
                .attr("y", d => y(d.rank))
                .attr("width", d => x(d.value) - x(0)));
    }

    function axis(svg) {
        const g = svg.append('g')
            .attr('transform', `translate(0,${margin.top})`);

        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));

        return (_, transition) => {
            g.transition(transition).call(axis);
            g.select('.tick:first-of-type text').remove();
            g.selectAll('.tick:not(:first-of-type) line').attr('stroke', 'white');
            g.select('.domain').remove();
        };
    }

    function labels(svg) {
    let label = svg.append("g")
        .style("font", "bold 30px var(--arial)")
        .style("font-variant-numeric", "tabular-nums")
        .attr("text-anchor", "end")
        .selectAll("text");

    return ([date, data], transition) => label = label
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", -6)
        .attr("dy", "-0.25em")
        .text(d => d.name)
        .call(text => text.append("tspan")
          .attr("fill-opacity", 0.7)
          .attr("font-weight", "normal")
          .attr("x", -6)
          .attr("dy", "1.15em")),
      update => update,
      exit => exit.transition(transition).remove()
        .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
        .call(g => g.select("tspan")
                    .textTween((d) => d3.interpolateRound(d.value, (next.get(d) || d).value))
             )
    )
    .call(bar => bar.transition(transition)
      .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
      .call(g => g.select("tspan")
                  .textTween((d) => (t) => formatNumber(
                    d3.interpolateNumber((prev.get(d) || d).value, d.value)(t)
                  ))
           )
    )
    }

    function ticker(svg) {
        const now = svg.append('text')
            .style('font', `bold ${barSize}px var(--sans-serif)`)
            .style('font-variant-numeric', 'tabular-nums')
            .attr('text-anchor', 'end')
            .attr('x', width - 6)
            .attr('y', margin.top + barSize * (n - 0.45))
            .attr('dy', '0.32em')
            .text(formatDate(keyframes[0][0]));

        return ([date], transition) => {
            transition.end().then(() => now.text(formatDate(date)));
        };
    }

    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        x.domain([0, keyframe[1][0].value]);

        updateAxis(keyframe, transition);
        updateBars(keyframe, transition);
        updateLabels(keyframe, transition);
        updateTicker(keyframe, transition);

        // invalidation.then(() => svg.interrupt());
        await transition.end();
    }
}

export async function loadHeatMap(data) {
    var mapCanvas = document.getElementById('map-canvas');

    var baseLayer = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '...',
        maxZoom: 18
    });

    var cfg = {
        radius: 0.0025,
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

    // Set up SVG dimensions
    var width = 700;
    var height = 50;
    var padding = 15;

    var heatmapLayer = new HeatmapOverlay(cfg);

    var map = new L.Map(mapCanvas, {
        center: new L.LatLng(40.7128, -74.0060),
        zoom: 10,
        layers: [baseLayer, heatmapLayer]
    });

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
