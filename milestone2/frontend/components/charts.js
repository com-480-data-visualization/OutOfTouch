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
            plugins: {
                tooltip: {
                    enabled: true,
                    intersect: false
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    min: dates[0], // Set minimum date
                    max: dates[dates.length - 1] // Set maximum date
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
