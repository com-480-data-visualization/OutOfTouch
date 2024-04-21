import { loadTimeSeriesData } from "./components/load.js";
import { loadTimeSeriesChart } from "./components/charts.js";
import {timeSeriesViz} from "./components/time_series.js";

async function init() {
    // const ctx = document.getElementById('myChart').getContext('2d');
    try {
        const { dates, counts } = await loadTimeSeriesData();
        loadTimeSeriesChart("myChart", dates, counts);
        // timeSeriesViz(ctx, dates, counts);
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

window.addEventListener("DOMContentLoaded", init);
