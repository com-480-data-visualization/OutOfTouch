import { loadTimeSeriesData } from "./components/load.js";
import { loadTimeSeriesChart } from "./components/charts.js";

async function init() {
    const ctx = document.getElementById('myChart').getContext('2d');
    try {
        const { dates, counts } = await loadTimeSeriesData();
        loadTimeSeriesChart(ctx, dates, counts);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener("DOMContentLoaded", init);
