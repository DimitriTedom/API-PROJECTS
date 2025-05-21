import fs from 'node:fs'
import {promisify} from 'node:util'
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const readFile = promisify(fs.readFile);

const JSON_PATH = path.join(__dirname, "../database.json");
const readEvents= async ()=> {
  try {
    const data = await readFile(JSON_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export default readEvents