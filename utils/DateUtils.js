export const getFormattedDateTime = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day
  const oneWeek = 7 * oneDay; // Milliseconds in a week

  const options = { timeZone: 'Asia/Kolkata', hour12: true, hour: 'numeric', minute: 'numeric' };
  const timeString = date.toLocaleTimeString('en-US', options);

  const diffDays = Math.round(Math.abs((today - date) / oneDay));

  if (diffDays === 0) {
    return `TODAY, ${timeString}`;
  } else if (diffDays === 1) {
    return `YESTERDAY, ${timeString}`;
  } else if (diffDays > 1 && diffDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeString}`;
  } else {
    return `${date.toLocaleDateString('en-US')}, ${timeString}`;
  }
}