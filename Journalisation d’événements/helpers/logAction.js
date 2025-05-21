import fs from 'node:fs'
const LOG_PATH = 'app.log';

// Stream d'écriture des logs
const logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });

// Helper pour le logging
const logAction = (message) =>{
  const timestamp = new Date().toISOString();
  logStream.write(`${timestamp} - ${message}\n`);
}

export default logAction