import { loadRaceData } from './data_loaders/load.js';
import { loadRaceChart } from './charts.js';

async function init() {
  try {
    const raceData = await loadRaceData(`taxis`); // add also bikes
    await loadRaceChart(raceData);
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

window.onload = init;
