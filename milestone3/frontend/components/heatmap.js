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

// function drawWavyRoad(canvasId, roadWidth, numLanes, perspectiveFactor, amplitude, frequency) {
//     var canvas = document.getElementById(canvasId);
//     var ctx = canvas.getContext('2d');

//     function drawRoad() {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         for (var i = 0; i < numLanes; i++) {
//             var laneOffset = i * (roadWidth / numLanes);
//             var laneWidthAtDistance = (roadWidth / numLanes) + i * perspectiveFactor * (roadWidth / numLanes);
            
//             ctx.beginPath();
//             ctx.moveTo(0, canvas.height / 2);

//             for (var x = 0; x <= canvas.width; x += 10) {
//                 var y = amplitude * Math.sin(x / frequency) + canvas.height / 2;
//                 ctx.lineTo(x, y);
//             }

//             ctx.lineTo(canvas.width, canvas.height);
//             ctx.lineTo(0, canvas.height);
//             ctx.closePath();
            
//             ctx.fillStyle = 'gray';
//             ctx.fill();
//         }
//     }

//     drawRoad();
// }

// Example usage:
// drawWavyRoad('roadCanvas', 300, 3, 0.1, 20, 100);


window.onload = init;
