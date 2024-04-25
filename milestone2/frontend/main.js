import {  loadRaceData} from "./components/load.js";
import {  loadRaceChart } from "./components/charts.js";

async function init() {
    
    try {
        const raceData = await loadRaceData(`taxis`) // add also bikes
        loadRaceChart(raceData);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener('DOMContentLoaded', init);