import { loadHeatMapData, loadSpiralData } from "./data_loaders/load.js";
import { removeTimeComponent } from "./utils/dateUtils.js";


export async function loadRaceChart(datax){

    let isAnimating = true;
    let currentIndex = 0;
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
    const duration = 100;

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
    const formatDate = d3.utcFormat("%B %Y")

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
        return "#ffffff";
    }

    function bars(svg) {
        let bar = svg.append('g')
            .attr('fill-opacity', 0.9)
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
        .attr("class", "label-down")
        .style("color", "white")
        .selectAll("text");

    return ([date, data], transition) => label = label
    .data(data.slice(0, n), d => d.name)
    .join(
      enter => enter.append("text")
        .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
        .attr("y", y.bandwidth() / 2)
        .attr("x", -6)
        .attr("dy", "-0.25em")
        .attr("class", "label-race-bold")
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
            .attr('class', 'label-down')
            .attr('class', 'labelx')
            .style('font-size', '45px')
            .style('font-weight', 'bold')
            .style('color', 'white')
            .attr('x', width - 6)
            .attr('y', margin.top + barSize * (n - 0.45))
            .attr('dy', '0.32em')
            .text(formatDate(keyframes[0][0]));

        return ([date], transition) => {
            transition.end().then(() => now.text(formatDate(date)));
        };
    }

    async function animateKeyframes(startIndex) {
        let index = startIndex;
        while (isAnimating && index < keyframes.length) {
            const keyframe = keyframes[index];
            const transition = svg.transition()
                .duration(duration)
                .ease(d3.easeLinear);

            x.domain([0, keyframe[1][0].value]);

            updateAxis(keyframe, transition);
            updateBars(keyframe, transition);
            updateLabels(keyframe, transition);
            updateTicker(keyframe, transition);

            await transition.end();

            index++;
        }
        return index; // Return the index of the last displayed keyframe
    }

    function startAnimation() {
        isAnimating = true;
        animateKeyframes(currentIndex).then((index) => {
            currentIndex = index; // Update currentIndex with the new value
        });
    }

    function stopAnimation() {
        isAnimating = false;
    }

    function resetAnimation() {
        stopAnimation(); // Stop animation if running
        currentIndex = 0; // Reset currentIndex to start from the beginning
        const transition = svg.transition().duration(0); // Instant transition for reset
        x.domain([0, d3.max(data, d => d.value)]); // Reset x domain
        updateAxis(keyframes[0], transition);
        updateBars(keyframes[0], transition);
        updateLabels(keyframes[0], transition);
        updateTicker(keyframes[0], transition);
    }

    const buttons = d3.selectAll('.race_navigation img');
    buttons.on('click', function() {
        const action = d3.select(this).attr('id');
        if (action === 'start') {
            startAnimation();
        } else if (action === 'stop') {
            stopAnimation();
        } else if (action === 'reset') {
            resetAnimation();
        }
    });

    // Start animation by default
    startAnimation();
}

export async function loadTimeSeriesChart(containerId, dates, counts) {
  // Convert date strings to JavaScript Date objects
  const parseDate = d3.timeParse('%d/%m/%Y');



  console.log("I am in the laod time seriees creater chart");
  const formattedData = dates.map((date, index) => ({
    date: parseDate(date),
    count: counts[index],
  }));

  const switchInput = document.getElementById('timeframe-switch');
  switchInput.addEventListener('change', (event) => {
    const filteredData = formattedData.filter((d) => {
        const dateToCompare = removeTimeComponent(d.date);
        return (
          selectedStartDate <= dateToCompare && dateToCompare <= selectedEndDate
        );
    });
    createChart(filteredData)
  });

  const minDate = new Date(Math.min(...formattedData.map((data) => data.date)));
  const maxDate = new Date(Math.max(...formattedData.map((data) => data.date)));

  const minDateString = minDate.toISOString().split('T')[0];
  const maxDateString = maxDate.toISOString().split('T')[0];

  console.log("THis is formatted data");
  console.log(formattedData);

  createChart(formattedData);

  // Get the input elements
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');
  startDateInput.value = minDateString;
  endDateInput.value = maxDateString;

  let selectedStartDate = new Date(startDateInput.value);
  let selectedEndDate = new Date(endDateInput.value);

  // Add input event listeners to update the chart
  startDateInput.addEventListener('input', (e) => {
    selectedStartDate = removeTimeComponent(new Date(e.target.value));
    const filteredData = formattedData.filter((d) => {
      const dateToCompare = removeTimeComponent(d.date);
      return (
        selectedStartDate <= dateToCompare && dateToCompare <= selectedEndDate
      );
    });

    createChart(filteredData);
  });
  endDateInput.addEventListener('input', (e) => {
    selectedEndDate = removeTimeComponent(new Date(e.target.value));
    const filteredData = formattedData.filter((d) => {
      const dateToCompare = removeTimeComponent(d.date);
      return (
        selectedStartDate <= dateToCompare && dateToCompare <= selectedEndDate
      );
    });

    createChart(filteredData);
  });

  function aggregateByMonth(data) {
    const aggregatedData = {};
  
    // Loop through the array
    data.forEach(item => {
      const monthYear = `${item.date.getFullYear()}-${(item.date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Check if the month exists in the aggregated data, if not, initialize it
      if (!aggregatedData[monthYear]) {
        aggregatedData[monthYear] = 0;
      }
      
      // Increment the count for the month
      aggregatedData[monthYear] += item.count;
    });

    const aggregatedArray = Object.entries(aggregatedData).map(([key, value]) => ({
        date: new Date(key + '-01'),
        count: value
    }));
  
    return aggregatedArray;
  }

  function formatYAxisTicks(d) {
    if (d >= 1e9) {
        return (d / 1e9).toFixed(0) + 'B'; // Convert to billion with one decimal place
    } else if (d >= 1e6) {
        return (d / 1e6).toFixed(0) + 'M'; // Convert to million with one decimal place
    } else if (d >= 1e3) {
        return (d / 1e3).toFixed(0) + 'K'; // Convert to thousand with one decimal place
    } else {
        return d.toString(); // Default formatting for smaller numbers
    }
  }

  function createChart(data) {
    if (switchInput.checked) {
        data = aggregateByMonth(data)
    }
    
    data.sort((a, b) => (a.date < b.date ? -1 : 1));

    // Set up dimensions
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 1200 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

    // Clear the svg container to draw a chart from scratch
    d3.selectAll('g > *').remove();

    // Create SVG element
    const svg = d3
      .select(`#${containerId}`)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.count)])
      .nice()
      .range([height, 0]);

    // Add axis labels
    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom)
      .text('Date');

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left * 3 / 4)
      .attr('x', -height / 2 + margin.left)
      .text('Occurrences');

    // Define axis generators
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat(d3.timeFormat('%Y-%m-%d'));
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(formatYAxisTicks);

    // Draw axes
    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg.append('g').attr('class', 'y-axis').call(yAxis);

    // Create line generator
    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.count))
      .curve(d3.curveMonotoneX);

    // Draw line
    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'rgb(75, 192, 192)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Draw circles for data points
    svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.count))
      .attr('r', 5)
      .attr('fill', 'rgb(75, 192, 192)')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);
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
      radius: 0.009,
      maxOpacity: .9,
      scaleRadius: true,
      useLocalExtrema: true,
      latField: 'latitude',
      lngField: 'longitude',
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
      fetchDataAndUpdateHeatmap(startDate, endDate, resource, true);
  });

  // Fetch data and update heatmap
  async function fetchDataAndUpdateHeatmap(startDate, endDate, resource, change) {
      try {
          if (change) {
            data = await loadHeatMapData(resource)
          }
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
      var maxValue = Math.max.apply(Math, data.data.map(function(o) { return o.count; }));

      // Update heatmap layer with data
      heatmapLayer.max = maxValue;
      heatmapLayer.setData(data);
  }

  const buttons = document.querySelectorAll('.post-it button');
  buttons.forEach(button => {
    button.addEventListener('click', function(event) {
      handleButtonClick(this);
    });
  });

  function handleButtonClick(button) {
    const buttonId = button.id;
    const category = button.getAttribute('category-button');

    var startDateEnd;
    var endDateEnd;
    // Perform actions based on the button clicked and the category
    switch (buttonId) {
        case 'button1':
          console.log('Button 1 clicked for category: ' + category);
          // Update the slider to value between 2019-01-01 and 2020-04-01
          startDateEnd = new Date('2019-01-01');
          endDateEnd = new Date('2020-03-01');
          break;
        case 'button2':
          console.log('Button 2 clicked for category: ' + category);
          // Add your code here for Button 2 action
          startDateEnd = new Date('2021-07-01');
          endDateEnd = new Date('2023-01-01');
          break;
        case 'button3':
          console.log('Button 3 clicked for category: ' + category);
          // Add your code here for Button 3 action
          startDateEnd = new Date('2020-03-01');
          endDateEnd = new Date('2021-07-01');
          break;
        default:
          console.log('Unknown button clicked');
          return;
    }
    updateSlider(startDateEnd, endDateEnd);
    // Fetch data and update heatmap with the selected resource and date range
    fetchDataAndUpdateHeatmap(startDateEnd, endDateEnd, category, category !== resourceSelect.value);

    // Set the resource select box value to "Accidents"
    document.getElementById('resource').value = category;
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

  function updateSlider(startDateEnd, endDateEnd) {
    const xScale = d3.scaleTime()
        .domain([startDate, endDate])
        .range([padding, width - padding])
        .clamp(true);

    handles.each(function(d, i) {
        const handle = d3.select(this);
        const handleDate = i === 0 ? startDateEnd : endDateEnd; // Get the date for each handle
        handle.attr('cx', xScale(handleDate)); // Update the x position of the handle
        values[i] = handleDate; // Update the values array
    });

    const startDateSpan = document.getElementById('start-date');
    const endDateSpan = document.getElementById('end-date');
    startDateSpan.textContent = startDateEnd.toLocaleDateString();
    endDateSpan.textContent = endDateEnd.toLocaleDateString();

    // Update the slider segments
  
    svg.selectAll('.slider-segment')
        .data([{
            x1: padding,
            x2: xScale(startDateEnd)
        }, {
            x1: xScale(startDateEnd),
            x2: xScale(endDateEnd)
        }, {
            x1: xScale(endDateEnd),
            x2: width - padding
        }])
        .attr('x1', d => d.x1)
        .attr('x2', d => d.x2);
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

export async function loadSpiralChart(selectedValue) {
    const width = 600;
    const height = 600;
    const zeroRadius = 125;
    const oneRadius = 200;
    const months = [
        "Mar", "Apr", "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"
    ];

    let selectedData = await loadSpiralData(selectedValue);
    console.log("_-----------------")
    console.log(selectedData)
    console.log("---------------------")
    const data = selectedData.data.data;

    // // Clear the svg container to draw a chart from scratch
    d3.select('#climate-spiral').selectAll('*').remove();


    // Find the maximum anomaly value for scaling
    const maxAnomaly = d3.max(data, d => d3.max(months, month => parseFloat(d[month])));
    const minAnomaly = d3.min(data, d => d3.min(months, month => parseFloat(d[month])));

    // Scaling functions
    const radiusScale = d3.scaleLinear()
        .domain([minAnomaly, maxAnomaly])
        .range([zeroRadius, oneRadius]);

    // Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    document.getElementById('climate-spiral').appendChild(renderer.domElement);

    camera.position.set(0, 500, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Create the spiral cylinder
    const geometry = new THREE.CylinderGeometry(zeroRadius, zeroRadius, height, 64, 64, true);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const cylinder = new THREE.Mesh(geometry, material);
    scene.add(cylinder);

    function animate() {
        requestAnimationFrame(animate);
        cylinder.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    animate();

    // D3.js 2D spiral representation
    const svg = d3.select('#climate-spiral')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    let currentRow = 1;
    let currentMonth = 0;
    let previousAnomaly = null;

    function draw() {
        svg.selectAll('*').remove();

        svg.append('circle')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', zeroRadius)
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 + zeroRadius + 13)
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', 16)
            .text(`${minAnomaly}`);

        svg.append('circle')
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', oneRadius)
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-width', 2);

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2 + oneRadius + 13)
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', 16)
            .text(`${maxAnomaly}`);

        for (let i = 0; i < months.length; i++) {
            let angle = (i / months.length) * 2 * Math.PI;
            let x = width / 2 + 264 * Math.cos(angle);
            let y = height / 2 + 264 * Math.sin(angle);
            svg.append('text')
                .attr('x', x)
                .attr('y', y)
                .attr('transform', `rotate(${angle * (180 / Math.PI) + 90},${x}, ${y})`)
                .attr('fill', '#fff')
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('font-size', 24)
                .text(months[i]);
        }

        const row = data[currentRow];
        const year = row.Year;

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('fill', '#fff')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', 32)
            .text(year);

        let firstValue = true;
        for (let j = 0; j < currentRow; j++) {
            const row = data[j];

            let totalMonths = months.length;
            if (j === currentRow - 1) {
                totalMonths = currentMonth;
            }

            for (let i = 0; i < totalMonths; i++) {
                let anomaly = row[months[i]];

                if (anomaly !== "*") {
                    anomaly = parseFloat(anomaly);
                    let angle = (i / months.length) * 2 * Math.PI - Math.PI / 3;
                    let pr = previousAnomaly !== null ? radiusScale(previousAnomaly) : zeroRadius;
                    let r = radiusScale(anomaly);

                    let x1 = width / 2 + r * Math.cos(angle);
                    let y1 = height / 2 + r * Math.sin(angle);
                    let x2 = width / 2 + pr * Math.cos(angle - Math.PI / 6);
                    let y2 = height / 2 + pr * Math.sin(angle - Math.PI / 6);

                    if (!firstValue) {
                        let avg = (anomaly + previousAnomaly) * 0.5;
                        let cold = d3.rgb(0, 0, 255);
                        let warm = d3.rgb(255, 0, 0);
                        let zero = d3.rgb(255, 255, 255);
                        let lineColor = d3.interpolateRgb(zero, avg < 0 ? cold : warm)(Math.abs(avg) / maxAnomaly);

                        svg.append('line')
                            .attr('x1', x1)
                            .attr('y1', y1)
                            .attr('x2', x2)
                            .attr('y2', y2)
                            .attr('stroke', lineColor)
                            .attr('stroke-width', 2);
                    }
                    firstValue = false;
                    previousAnomaly = anomaly;
                }
            }
        }

        currentMonth = currentMonth + 1;
        if (currentMonth === months.length) {
            currentMonth = 0;
            currentRow = currentRow + 1;
            if (currentRow === data.length) {
                noLoop();
            }
        }
    }

    function noLoop() {
        clearInterval(interval);
    }

    let interval = setInterval(draw, 100);
}

