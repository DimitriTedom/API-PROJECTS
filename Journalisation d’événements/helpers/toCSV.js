const toCSV = (event)=> {
  return `${event.id},${event.name},${event.timestamp}\n`;
}
export default toCSV