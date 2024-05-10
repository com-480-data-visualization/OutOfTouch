export function formatDate(toFormatDate) {
  const date = new Date(
    toFormatDate._id.year,
    toFormatDate._id.month,
    toFormatDate._id.day
  );

  // Get day, month, and year from the Date object
  const day = ('0' + date.getDate()).slice(-2); // Add leading zero and take last two characters
  const month = ('0' + date.getMonth()).slice(-2); // Add leading zero and take last two characters
  const year = date.getFullYear();

  // Construct the date string in the "day/mm/yyyy" format
  return day + '/' + month + '/' + year;
}

export function removeTimeComponent(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// TODO: delete this function
export function generateRandomDates(startDate, endDate, numberOfDates) {
  const randomDates = [];
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();

  for (let i = 0; i < numberOfDates; i++) {
    const randomTimestamp =
      startTimestamp + Math.random() * (endTimestamp - startTimestamp);
    const randomDate = new Date(randomTimestamp);
    randomDates.push(randomDate);
  }

  return randomDates.map((date) => new Date(date));
}
