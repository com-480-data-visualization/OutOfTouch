
import { loadTimeSeriesChart } from './charts.js';
import { loadTimeSeriesData } from './load.js';

async function init() {
    try {
        const { dates, counts } = await loadTimeSeriesData('accidents');
        loadTimeSeriesChart('myChart', dates, counts);
        const selectDropdown = document.getElementById('ds-select');

        selectDropdown.addEventListener('change', async function () {
            const selectedValue = selectDropdown.value;
            const { dates, counts } = await loadTimeSeriesData(selectedValue);
            console.log(dates)
            console.log(counts)
            loadTimeSeriesChart('myChart', dates, counts);
        });
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener('DOMContentLoaded', init);
