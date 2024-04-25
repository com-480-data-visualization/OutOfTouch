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

