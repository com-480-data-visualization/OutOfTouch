function removeTimeComponent(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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


export async function loadTimeSeriesChart(containerId, dates, counts) {
    // Convert date strings to JavaScript Date objects
    const parseDate = d3.timeParse("%d/%m/%Y");

    const formattedData = dates.map((date, index) => ({
        date: parseDate(date),
        count: counts[index]
    }));

    const minDate = new Date(Math.min(...formattedData.map((data) => data.date)));
    const maxDate = new Date(Math.max(...formattedData.map((data) => data.date)));

    const minDateString = minDate.toISOString().split('T')[0];
    const maxDateString = maxDate.toISOString().split('T')[0];


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

    function createChart(data) {
        data.sort((a, b) => (a.date < b.date ? -1 : 1));

        // Set up dimensions
        const margin = { top: 20, right: 50, bottom: 50, left: 50 };
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
            .attr('x', width/2)
            .attr('y', height + margin.bottom)
            .text('Date');

        svg
            .append('text')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
            .attr('y', margin.left)
            .attr('x', -height/2 + margin.left)
            .text('Occurrences');

        // Define axis generators
        const xAxis = d3
            .axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.timeFormat('%Y-%m-%d'));
        const yAxis = d3.axisLeft(yScale).ticks(5);

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