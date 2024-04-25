import { loadTimeSeriesData } from './components/load.js';
import { loadTimeSeriesChart } from './components/charts.js';
// import { timeSeriesViz } from './components/time_series.js';

// async function init() {
//     // const ctx = document.getElementById('myChart').getContext('2d');
//     try {
//         const { dates, counts } = await loadTimeSeriesData();
//         loadTimeSeriesChart('myChart', dates, counts);
//         // timeSeriesViz(ctx, dates, counts);

//         const selectDropdown = document.getElementById('ds-select');

//         selectDropdown.addEventListener('change', function () {
//             const selectedValue = selectDropdown.value;

//             switch (selectedValue) {
//                 case 'ds1':
//                     console.log('selected ds1');
//                     loadTimeSeriesChart('myChart', dates, counts);
//                     break;
//                 case 'ds2':
//                     console.log('selected ds2');
//                     loadTimeSeriesChart('myChart', dates, counts);
//                     break;
//                 case 'ds3':
//                     console.log('selected ds3');
//                     loadTimeSeriesChart('myChart', dates, counts);
//                     break;
//             }
//         });
//     } catch (error) {
//         console.error('Error initializing chart:', error);
//     }
// }

// window.addEventListener('DOMContentLoaded', init);