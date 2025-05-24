import { promises as fs } from 'fs';
import { promisify } from 'util';
import { EventEmitter } from 'events';
import { parse, stringify } from 'csv/sync'

const taskEmitter = new EventEmitter();

// Promisification des fonctions CSV
const stringifyAsync = promisify(stringify);
const parseAsync = promisify(parse);

const JSON_FILE_PATH = './databse.json';
const CSV_FILE_PATH = './databse.csv';

const readJsonFile = async () => {
  try {
    const data = await fs.readFile(JSON_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(JSON_FILE_PATH, '[]', 'utf8');
      return [];
    }
    throw error;
  }
};

const writeJsonFile = async (data) => {
  await fs.writeFile(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

const readCsvFile = async () => {
  try {
    const data = await fs.readFile(CSV_FILE_PATH, 'utf8');
    return await parseAsync(data, { columns: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(CSV_FILE_PATH, '', 'utf8');
      return [];
    }
    throw error;
  }
};

const writeCsvFile = async (data) => {
  const csvData = await stringifyAsync(data, { header: true });
  await fs.writeFile(CSV_FILE_PATH, csvData, 'utf8');
};

export const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const tasks = await readJsonFile();
    
    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await writeJsonFile(tasks);
    
    // Mise à jour du fichier CSV
    const csvTasks = await readCsvFile();
    csvTasks.push(newTask);
    await writeCsvFile(csvTasks);
    
    // Émission de l'événement
    taskEmitter.emit('taskCreated', newTask);
    
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await readJsonFile();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readJsonFile();
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
    const tasks = await readJsonFile();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      title: title || tasks[taskIndex].title,
      description: description || tasks[taskIndex].description,
      status: status || tasks[taskIndex].status,
      updatedAt: new Date().toISOString()
    };
    
    tasks[taskIndex] = updatedTask;
    await writeJsonFile(tasks);
    
    // Mise à jour du fichier CSV
    const csvTasks = await readCsvFile();
    const csvTaskIndex = csvTasks.findIndex(t => t.id === id);
    if (csvTaskIndex !== -1) {
      csvTasks[csvTaskIndex] = updatedTask;
      await writeCsvFile(csvTasks);
    }
    
    // Émission de l'événement
    taskEmitter.emit('taskUpdated', updatedTask);
    
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await readJsonFile();
    const taskIndex = tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const [deletedTask] = tasks.splice(taskIndex, 1);
    await writeJsonFile(tasks);
    
    // Mise à jour du fichier CSV
    const csvTasks = await readCsvFile();
    const updatedCsvTasks = csvTasks.filter(t => t.id !== id);
    await writeCsvFile(updatedCsvTasks);
    
    // Émission de l'événement
    taskEmitter.emit('taskDeleted', deletedTask);
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export de l'EventEmitter pour une utilisation externe si nécessaire
export { taskEmitter };