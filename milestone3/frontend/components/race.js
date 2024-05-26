import { loadRaceData } from './data_loaders/load.js';
import { loadRaceChart } from './charts.js';

let taxiRaceData;
let bikeRaceData;
let crashesRaceData;

async function init() {
  try {
    taxiRaceData = await loadRaceData("taxis"); // add also bikes
    bikeRaceData = await loadRaceData("bikes");
    crashesRaceData = await loadRaceData("accidents");
    load("Taxis");
  } catch (error) {
    console.error('Error initializing chart:', error);
  }
}

async function load(data) {
    try {
        if (data === "Taxis") {
            const svg = d3.select('#bar-chart-race');
            svg.selectAll("*").remove(); // Remove all existing elemen
            loadRaceChart(taxiRaceData);
        }
        else if (data === "Bikes") {
            const svg = d3.select('#bar-chart-race');
            svg.selectAll("*").remove(); // Remove all existing elemen
            loadRaceChart(bikeRaceData);
        }
        else {
            const svg = d3.select('#bar-chart-race');
            svg.selectAll("*").remove(); // Remove all existing elemen
            loadRaceChart(crashesRaceData);
        }
    } catch (error) {
        console.error('Error loading chart:', error);
    }
}

document.getElementById('resource').addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    load(selectedOption);
});

window.onload = init;
