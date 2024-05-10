import { loadTimeSeriesData } from './data_loaders/load.js';
import { loadTimeSeriesChart } from './charts.js';



async function init() {
  try {
    // TODO: uncomment this line
    const { dates, counts } = await loadTimeSeriesData('accidents');

    // TODO: delete this block {
    // const nr = 500;
    // const dates = generateRandomDates(
    //   new Date('2010-01-01'),
    //   new Date('2021-01-01'),
    //   nr
    // );
    // const counts = [...new Array(nr)].map((n, i) => i);
    // // }

    loadTimeSeriesChart('myChart', dates, counts);
    const selectDropdown = document.getElementById('ds-select');

    selectDropdown.addEventListener('change', async function () {
      const selectedValue = selectDropdown.value;
      const { dates, counts } = await loadTimeSeriesData(selectedValue);
      // TODO: delete this block {
      // const nr = 500;
      // const dates = generateRandomDates(
      //   new Date('2010-01-01'),
      //   new Date('2021-01-01'),
      //   nr
      // );
      // const counts = [...new Array(nr)].map((n, i) => i);
      // }
      loadTimeSeriesChart('myChart', dates, counts);
    });
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

window.onload = init;
