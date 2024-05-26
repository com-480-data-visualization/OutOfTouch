import { loadTimeSeriesData } from './data_loaders/load.js';
import { loadSpiralChart, loadTimeSeriesChart } from './charts.js';

async function init() {
  try {
    const { dates, counts } = await loadTimeSeriesData('accidents');

    loadSpiralChart("accidents");
    loadTimeSeriesChart('myChart', dates, counts);

    const selectDropdown = document.getElementById('ds-select');
    const watchAgain = document.getElementById('watch-again-btn');

    selectDropdown.addEventListener('change', async function () {
      // timeseries
      const selectedValue = selectDropdown.value;
      const { dates, counts } = await loadTimeSeriesData(selectedValue);

      // spiral
      loadSpiralChart(selectedValue);
      loadTimeSeriesChart('myChart', dates, counts);
    });

    watchAgain.addEventListener('click', async function () {
      const selectedValue = selectDropdown.value;
      loadSpiralChart(selectedValue);
    });

  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const switchInput = document.getElementById('timeframe-switch');
  const sliderTextOn = document.getElementById('slider-text-on');
  const sliderTextOff = document.getElementById('slider-text-off');

  function updateSliderText() {
    if (switchInput.checked) {
      sliderTextOn.style.visibility = 'visible';
      sliderTextOff.style.visibility = 'hidden';
    } else {
      sliderTextOn.style.visibility = 'hidden';
      sliderTextOff.style.visibility = 'visible';
    }
  }

  // Initialize the slider text
  updateSliderText();

  // Add event listener for switch state change
  switchInput.addEventListener('change', updateSliderText);
});

window.onload = init;






// import { loadTimeSeriesData } from './data_loaders/load.js';
// import { loadSpiralChart, loadTimeSeriesChart } from './charts.js';
//
//
//
// async function init() {
//   try {
//     // TODO: uncomment this line
//     const { dates, counts } = await loadTimeSeriesData('accidents');
//
//     // TODO: delete this block {
//     // const nr = 500;
//     // const dates = generateRandomDates(
//     //   new Date('2010-01-01'),
//     //   new Date('2021-01-01'),
//     //   nr
//     // );
//     // const counts = [...new Array(nr)].map((n, i) => i);
//     // // }
//
//     console.log(dates);
//     console.log(counts);
//
//     loadTimeSeriesChart('myChart', dates, counts);
//     const selectDropdown = document.getElementById('ds-select');
//
//     selectDropdown.addEventListener('change', async function () {
//       const selectedValue = selectDropdown.value;
//       const { dates, counts } = await loadTimeSeriesData(selectedValue);
//       // TODO: delete this block {
//       // const nr = 500;
//       // const dates = generateRandomDates(
//       //   new Date('2010-01-01'),
//       //   new Date('2021-01-01'),
//       //   nr
//       // );
//       // const counts = [...new Array(nr)].map((n, i) => i);
//       // }
//
//       loadTimeSeriesChart('myChart', dates, counts);
//       // loadSpiralChart(dates);
//     });
//   } catch (error) {
//     console.error('Error initializing chart:', error);
//   }
// }
//
// document.addEventListener('DOMContentLoaded', (event) => {
//   const switchInput = document.getElementById('timeframe-switch');
//   const sliderTextOn = document.getElementById('slider-text-on');
//   const sliderTextOff = document.getElementById('slider-text-off');
//
//   function updateSliderText() {
//     if (switchInput.checked) {
//       sliderTextOn.style.visibility = 'visible';
//       sliderTextOff.style.visibility = 'hidden';
//     } else {
//       sliderTextOn.style.visibility = 'hidden';
//       sliderTextOff.style.visibility = 'visible';
//     }
//   }
//
//   // Initialize the slider text
//   updateSliderText();
//
//   // Add event listener for switch state change
//   switchInput.addEventListener('change', updateSliderText);
// });
//
// window.onload = init;
