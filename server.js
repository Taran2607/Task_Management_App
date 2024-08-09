const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// In-memory task storage
let tasks = [];

// Add a task
app.post('/tasks', (req, res) => {
  const task = req.body;
  tasks.push(task);
  res.status(201).json(task);
});

// Update a task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updatedTask = req.body;
  tasks = tasks.map(task => (task.id === id ? updatedTask : task));
  res.json(updatedTask);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id !== id);
  res.status(204).end();
});

// Upload a task file
app.post('/tasks', upload.single('file'), (req, res) => {
    console.log('File:', req.file);
    console.log('Body:', req.body);
  
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    const task = {
      name: req.body.name,
      filePath: req.file.path
    };
  
    tasks.push(task);
    res.status(201).json(task);
  });

// Upload tasks from an Excel file
app.post('/upload-excel', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
  
    try {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
  
      tasks = data.map(task => ({
        name: task.name,
        filePath: task.filePath // Ensure your Excel file includes this field
      }));
  
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Error processing Excel file:', error);
      res.status(500).json({ error: 'Error processing Excel file' });
    }
  });
  app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});