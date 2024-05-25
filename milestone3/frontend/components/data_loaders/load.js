function formatDate(toFormatDate) {
  const parts = toFormatDate.split('-'); // Split the date string by '-'
  const year = parseInt(parts[0]); // Extract year and convert to integer
  const month = parseInt(parts[1]); // Extract month and convert to integer
  const day = parseInt(parts[2]); // Extract day and convert to integer

  const date = new Date(year, month - 1, day); // Month is zero-indexed

  // Get day, month, and year from the Date object
  const formattedDay = ('0' + date.getDate()).slice(-2); // Add leading zero and take last two characters
  const formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2); // Month is zero-indexed, so add 1
  const formattedYear = date.getFullYear();

  // Construct the date string in the "dd/mm/yyyy" format
  return formattedDay + '/' + formattedMonth + '/' + formattedYear;
}

export async function loadTimeSeriesData(resource) {
  return fetch(`http://localhost:5000/api/${resource}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      data = data[`${resource}`];
      // Extract dates and counts from the data

      const dates = data.map((entry) => formatDate(entry.date));
      const counts = data.map((entry) => entry.count);
      return { dates, counts };
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    });
}

export async function loadHeatMapData(resource, start_date="2019-01-01", end_date="2023-01-01") {
  return fetch(
    `http://localhost:5000/api/${resource}/coordinates?start_date=${start_date}&end_date=${end_date}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const result = {
        data: data,
      };
      return result;
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    });
}

export async function loadRaceData(resource) {
    console.log("RESOURCE: ", resource);
  return fetch(`http://localhost:5000/api/${resource}/race`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const result = {
        data: data,
      };
      return result;
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    });
}
