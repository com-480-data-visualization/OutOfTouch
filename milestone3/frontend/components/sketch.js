let data;
let zeroRadius = 50; // Base radius for minimum count
let oneRadius = 250; // Base radius for maximum count
let currentMonth = 0;
let currentYear = 0;
let months = [
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
];

let accidentsPerYearMonth = {};
let minCount;
let maxCount;
let years = [];
let yearColors = ['#DE5D09', '#338589', '#1BE17C', '#DE9409'];

function preload() {
  data = loadTable('../../../data/crashes_timeseries.csv', 'csv', 'header');
}

function setup() {
  createCanvas(600, 600);

  // Count accidents per month for each year
  for (let i = 0; i < data.getRowCount(); i++) {
    let row = data.getRow(i);
    let crash_date = row.get('crash_date');
    let [year, month] = crash_date.split('-').map(Number);
    month--; // Convert month to 0-11 index

    if (!accidentsPerYearMonth[year]) {
      accidentsPerYearMonth[year] = Array(12).fill(0);
      years.push(year);
    }
    accidentsPerYearMonth[year][month]++;
  }

  // Find min and max counts for scaling
  minCount = Infinity;
  maxCount = -Infinity;
  for (let year of years) {
    for (let count of accidentsPerYearMonth[year]) {
      if (count > maxCount) maxCount = count;
      if (count < minCount) minCount = count;
    }
  }
}

function draw() {
  background(0);
  translate(width / 2, height / 2);
  textAlign(CENTER, CENTER);
  textSize(16);
  stroke(255);
  strokeWeight(2);
  noFill();

  // Draw month labels in a spiral
  for (let i = 0; i < months.length; i++) {
    noStroke();
    fill(255);
    textSize(24);
    let angle = map(i, 0, months.length, 0, TWO_PI);
    push();
    let x = 264 * cos(angle);
    let y = 264 * sin(angle);
    translate(x, y);
    rotate(angle + PI / 2);
    text(months[i], 0, 0);
    pop();
  }

  // Draw circles for visual reference
  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, zeroRadius * 2);
  fill(255);
  noStroke();
  text(minCount, 0, 0);

  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, oneRadius * 2);
  fill(255);
  noStroke();
  text(maxCount, oneRadius - 35, 0);

  stroke(255);
  strokeWeight(2);
  noFill();
  circle(0, 0, 500);

  // Draw lines representing the number of accidents in a spiral
  noFill();
  strokeWeight(2);

  let firstValue = true;
  let previousAccidents = minCount; // Start with minCount

  // Iterate through each year and month to plot the lines
  for (let y = 0; y <= currentYear; y++) {
    let year = years[y];
    let totalMonths = months.length;

    if (y == currentYear) {
      totalMonths = currentMonth;
    }

    for (let m = 0; m < totalMonths; m++) {
      let accidents = accidentsPerYearMonth[year][m];
      let angle = map(m, 0, months.length, 0, TWO_PI) - PI / 3;
      let pr = map(
        previousAccidents,
        minCount,
        maxCount,
        zeroRadius,
        oneRadius
      );
      let r = map(accidents, minCount, maxCount, zeroRadius, oneRadius);

      let x1 = r * cos(angle);
      let y1 = r * sin(angle);
      let x2 = pr * cos(angle - PI / 6);
      let y2 = pr * sin(angle - PI / 6);

      if (!firstValue) {
        stroke(yearColors[y % yearColors.length]);
        line(x2, y2, x1, y1);
      }
      firstValue = false;
      previousAccidents = accidents;
    }
  }

  currentMonth++;
  if (currentMonth > months.length) {
    currentMonth = 0;
    currentYear++;
    if (currentYear == years.length) {
      noLoop();
    }
  }

  document
    .getElementById('chart-container')
    .prepend(document.getElementById('defaultCanvas0'));
}
