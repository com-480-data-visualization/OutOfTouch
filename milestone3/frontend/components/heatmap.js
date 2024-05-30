import { loadHeatMapData } from './data_loaders/load.js';
import { loadHeatMap } from './charts.js';

async function init() {
  try {
    const resourceOption = document.getElementById('resource');
    const dataHeatMap = await loadHeatMapData(`${resourceOption.value}`);
    loadHeatMap(dataHeatMap);
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

window.onload = init;
