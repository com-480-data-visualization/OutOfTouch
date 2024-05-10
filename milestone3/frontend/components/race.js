async function loadRaceChart(datax){

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
    const formatDate = d3.utcFormat("%m-%Y")

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

    let colors = d3.scaleOrdinal(d3.schemeCategory10); // Initialize with default colors

    const color = (data) => {
        const existingNames = new Set(colors.domain()); // Get existing names in the color scale
        const names = data.map(d => d.name); // Extract names from data
        names.forEach(name => {
            if (!existingNames.has(name)) {
                existingNames.add(name);
                colors.domain([...existingNames]); // Extend the domain with new names
            }
        });
        return d => colors(d.name); // Return color based on the name
    };



    function bars(svg) {
        let bar = svg.append('g')
            .attr('fill-opacity', 0.6)
            .selectAll('rect');

        return ([date, data], transition) => bar = bar
            .data(data.slice(0, n), d => d.name)
            .join(
                enter => enter.append("rect")
                    .attr("fill", d => color(data)(d))
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
            .style('font', `bold ${Math.floor(barSize * 0.8)}px var(--sans-serif)`) // Adjusted font size
            .style('font-variant-numeric', 'tabular-nums')
            .attr('text-anchor', 'end')
            .attr('class', 'label-down')
            .style('font-weight', 'bold')
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

async function loadRaceData(resource) {
    return fetch(`http://localhost:5000/api/${resource}/race`)
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

async function main() {
    try {
        const raceData = await loadRaceData(`taxis`) // add also bikes
        await loadRaceChart(raceData);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.onload = main;