import { loadTimeSeriesData, loadHeatMapData, loadRaceData} from "./components/load.js";
import { loadTimeSeriesChart, loadHeatMap, loadRaceChart } from "./components/charts.js";

async function init() {
    const ctx = document.getElementById('myChart').getContext('2d');
    try {
        const { dates, counts } = await loadTimeSeriesData();
        loadTimeSeriesChart(ctx, dates, counts);
        const resourceOption = document.getElementById('resource')
        const dataHeatMap = await loadHeatMapData(`${resourceOption.value}`)
        loadHeatMap(dataHeatMap);
        const raceData = await loadRaceData(`taxis`) // add also bikes
        loadRaceChart(raceData);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}


window.addEventListener("DOMContentLoaded", init);
