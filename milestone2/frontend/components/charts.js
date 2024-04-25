function removeTimeComponent(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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
        const margin = { top: 20, right: 30, bottom: 20, left: 30 };
        const width = 1200 - margin.left - margin.right;
        const height = 800 - margin.top - margin.bottom;

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
            .attr('x', width)
            .attr('y', height + margin.top + 20)
            .text('Date');

        svg
            .append('text')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-90)')
            .attr('y', -margin.left)
            .attr('x', -margin.top)
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