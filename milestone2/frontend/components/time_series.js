
import { loadTimeSeriesChart } from './charts.js';
import { loadTimeSeriesData } from './load.js';

async function init() {
    try {
        const { dates, counts } = await loadTimeSeriesData();
        loadTimeSeriesChart('myChart', dates, counts);
        const selectDropdown = document.getElementById('ds-select');

        selectDropdown.addEventListener('change', function () {
            const selectedValue = selectDropdown.value;

            switch (selectedValue) {
                case 'ds1':
                    console.log('selected ds1');
                    loadTimeSeriesChart('myChart', dates, counts);
                    break;
                case 'ds2':
                    console.log('selected ds2');
                    loadTimeSeriesChart('myChart', dates, counts);
                    break;
                case 'ds3':
                    console.log('selected ds3');
                    loadTimeSeriesChart('myChart', dates, counts);
                    break;
            }
        });
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener('DOMContentLoaded', init);
