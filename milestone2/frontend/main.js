import { loadTimeSeriesData, loadHeatMapData } from "./components/load.js";
import { loadTimeSeriesChart, loadHeatMap } from "./components/charts.js";

async function init() {
    const ctx = document.getElementById('myChart').getContext('2d');
    try {
        const { dates, counts } = await loadTimeSeriesData();
        loadTimeSeriesChart(ctx, dates, counts);
        const resourceOption = document.getElementById('resource')
        const dataHeatMap = await loadHeatMapData(`${resourceOption.value}`)
        loadHeatMap(dataHeatMap)
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}


window.addEventListener("DOMContentLoaded", init);
