export async function loadTimeSeriesChart(containerId, dates, counts) {
    // Convert date strings to JavaScript Date objects
    const parseDate = d3.timeParse("%m/%d/%Y");
    const formattedData = dates.map((date, index) => ({
        date: parseDate(date),
        count: counts[index]
    }));

    const firstTenElements = formattedData.slice(0, 10);
    const firstTenDates = dates.slice(0, 10);
    console.log('Printam aici debug')
    console.log(firstTenElements);
    console.log('Printam aici debug')
    console.log(firstTenDates);


    // Set up dimensions


    const container = document.getElementById(`chart-container`);
    console.log(container)
    const parentWidth = container.clientWidth;
    const parentHeight = window.innerHeight - container.offsetTop; // Adjusted for page scroll and header height

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = parentWidth - margin.left - margin.right;
    const height = parentHeight - margin.top - margin.bottom;

    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.count)])
        .nice()
        .range([height, 0]);

    // Create line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.count))
        .curve(d3.curveMonotoneX);

    // Draw line
    svg.append("path")
        .datum(formattedData)
        .attr("fill", "none")
        .attr("stroke", "rgb(75, 192, 192)")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Draw circles for data points
    svg.selectAll(".dot")
        .data(formattedData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.count))
        .attr("r", 5)
        .attr("fill", "rgb(75, 192, 192)")
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    // Add axis labels
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.top + 20)
        .text("Date");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Occurrences");

    // Define axis generators
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%Y-%m-%d"));
    const yAxis = d3.axisLeft(yScale).ticks(5);

    // Draw axes
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Get the input elements
    const startDateInput = document.getElementById("start-date");
    const endDateInput = document.getElementById("end-date");

    // Add input event listeners to update the chart
    startDateInput.addEventListener("input", updateChart);
    endDateInput.addEventListener("input", updateChart);

    function updateChart() {
        const startDate = new Date(startDateInput.value);
        const endDate = new Date(endDateInput.value);
        const filteredData = formattedData.filter(d => d.date >= startDate && d.date <= endDate);

        xScale.domain(d3.extent(filteredData, d => d.date));
        yScale.domain([0, d3.max(filteredData, d => d.count)]);

        svg.select(".x-axis").call(xAxis);
        svg.select(".y-axis").call(yAxis);

        svg.select(".line")
            .datum(filteredData)
            .attr("d", line);

        svg.selectAll(".dot")
            .data(filteredData)
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.count));
    }
}
