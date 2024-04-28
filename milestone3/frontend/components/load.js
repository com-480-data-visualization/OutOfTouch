
function formatDate(toFormatDate) {
    const date = new Date(toFormatDate._id.year, toFormatDate._id.month, toFormatDate._id.day);

    // Get day, month, and year from the Date object
    const day = ('0' + date.getDate()).slice(-2); // Add leading zero and take last two characters
    const month = ('0' + (date.getMonth())).slice(-2); // Add leading zero and take last two characters
    const year = date.getFullYear();

    // Construct the date string in the "day/mm/yyyy" format
    return day + '/' + month + '/' + year;
}

export async function loadTimeSeriesData(resource) {
    return fetch(`http://localhost:5000/api/${resource}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            data = data[`${resource}`]
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