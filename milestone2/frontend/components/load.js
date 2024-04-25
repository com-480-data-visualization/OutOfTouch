
function formatDate(toFormatDate) {
    const date = new Date(toFormatDate._id.year, toFormatDate._id.month, toFormatDate._id.day);

    // Get day, month, and year from the Date object
    const day = ('0' + date.getDate()).slice(-2); // Add leading zero and take last two characters
    const month = ('0' + (date.getMonth())).slice(-2); // Add leading zero and take last two characters
    const year = date.getFullYear();

    // Construct the date string in the "day/mm/yyyy" format
    return day + '/' + month + '/' + year;
}

export async function loadTimeSeriesData() {
    return fetch('http://localhost:5000/api/accidents')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data = data.accidents
            // Extract dates and counts from the data
            const dates = data.map(entry => formatDate(entry));
            const counts = data.map(entry => entry.count);
            return {dates, counts}
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            throw error
        });
}

export async function loadHeatMapData(resource) {
    return fetch(`http://localhost:5000/api/${resource}/coordinates?start_date=2019-01-01&end_date=2023-01-01`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const result = {
                "data" : data
            }
            return result
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            throw error
        });
}

export async function loadRaceData(resource) {
    return fetch(`http://localhost:5000/api/${resource}/race`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            const result = {
                "data" : data
            }
            return result
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            throw error
        });
}