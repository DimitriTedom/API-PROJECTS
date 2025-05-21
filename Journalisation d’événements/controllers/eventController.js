import { fileURLToPath } from "url";
import { promisify } from "util";
import logAction from "../helpers/logAction.js";
import fs from "node:fs";
import readEvents from "../helpers/readEvents.js";
import path from "path";
import toCSV from "../helpers/toCSV.js";
import zlib from 'node:zlib'
import { pipeline } from "node:stream";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, "../database.csv");
const JSON_PATH = path.join(__dirname, "../database.json");
const LOG_PATH =  path.join(__dirname, "../app.log");

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
/*My Logic :
The logging part: each method needs to log the action. So for each controller method, after performing the CRUD operation, 
i should write a log entry. The log is written via a Writable stream. So perhaps in the controller,
 there's a setup where a write stream is created (by appending to a log file), and each method writes to that stream.


 I WILL FOLLOW THE FOLLOWING STEPS FOR MY CONTROLLERS

 1. createEvent:

- Receive event data in the request body.

- Append the event to a JSON file (or maybe an in-memory array, but likely a file since CSV is involved).

- Append the same event to a CSV file.

- Write a log entry via the Writable stream indicating the event was created.

2. getAllEvents:

- Read all events from the JSON file (or data store) and send as response.

- Log that a request was made to get all events.

3. getEventById:

- Read events from JSON data, find the one with matching ID.

- If found, send it; else, send 404.

- Log the access to that event ID.

4. updateEvent:

- Find the event by ID in JSON/CSV, update it.

- Save the updated data back to both files.

- Log the update.

5. deleteEvent:

- Remove the event from JSON and CSV files.

- Log the deletion.

6. compressLogs:

- Use zlib to create a Gzip of the log file.

- Save the compressed file as logs.gz or similar.

- Maybe send a response indicating success.
*/

const eventController = {
  createEvent: async (req, res) => {
    try {
      const event = {
        id: Date.now().toString(),
        ...req.body,
        timestamp: new Date().toISOString(),
      };

      const events = await readEvents();
      events.push(event);
      await writeFile(JSON_PATH, JSON.stringify(events, null, 2));

      await appendFile(CSV_PATH, toCSV(event));

      logAction(`CREATE event ${event.id}`);
      res.status(201).json(event);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getAllEvents: async (req, res) => {
    try {
      const events = await readEvents();
      logAction("GET all events");
      res.json(events).status(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  getEventById: async (req, res) => {
    try {
      const events = await readEvents();
      const event = events.find((e) => e.id === req.params.id);

      if (!event) {
        logAction(`GET failed - event ${req.params.id} not found`);
        return res.status(404).send("Event not found");
      }

      logAction(`GET event ${req.params.id}`);
      res.json(event).status(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  updateEvent: async (req, res) => {
    try {
      let events = await readEvents();
      const index = events.findIndex((e) => e.id === req.params.id);

      if (index === -1) {
        logAction(`UPDATE failed - event ${req.params.id} not found`);
        return res.status(404).send("Event not found");
      }


      events[index] = { ...events[index], ...req.body };
      await writeFile(JSON_PATH, JSON.stringify(events, null, 2));


      const csvData = events.map(toCSV).join("");
      await writeFile(CSV_PATH, csvData);

      logAction(`UPDATE event ${req.params.id}`);
      res.json(events[index]);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  deleteEvent: async (req, res) => {
    try {
      let events = await readEvents();
      const index = events.findIndex((e) => e.id === req.params.id);

      if (index === -1) {
        logAction(`DELETE failed - event ${req.params.id} not found`);
        return res.status(404).send("Event not found");
      }


      const [deleted] = events.splice(index, 1);
      await writeFile(JSON_PATH, JSON.stringify(events, null, 2));

      const csvData = events.map(toCSV).join("");
      await writeFile(CSV_PATH, csvData);

      logAction(`DELETE event ${req.params.id}`);
      res.json(deleted).status(200);
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  compressLogs: (req, res) => {
    const source = fs.createReadStream(LOG_PATH);
    const destination = fs.createWriteStream(`${LOG_PATH}.gz`);
    const gzip = zlib.createGzip();

    pipeline(
    source,
    gzip,
    destination,
    (err) => {
      if (err) {
        logAction(`COMPRESSION ERROR: ${err.message}`);
        res.status(500).send('Compression failed');
      } else {
        logAction('LOG compression completed');
        res.send('Logs compressed successfully');
      }
    }
  );
  },
};

export default eventController;
