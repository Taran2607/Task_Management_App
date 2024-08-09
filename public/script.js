document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const excelFile = document.getElementById('excelFile');
    const uploadExcelButton = document.getElementById('uploadExcel');
    const taskList = document.getElementById('taskList');
  
    // Add a task
    taskForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const taskName = document.getElementById('taskName').value;
      const taskFile = document.getElementById('taskFile').files[0];
      const formData = new FormData();
      formData.append('name', taskName);
      if (taskFile) {
        formData.append('file', taskFile);
      }
  
      await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        body: formData
      });
  
      fetchTasks();
    });
  
    // Upload tasks from Excel
    uploadExcelButton.addEventListener('click', async () => {
      const file = excelFile.files[0];
      const formData = new FormData();
      formData.append('file', file);
  
      await fetch('http://localhost:3000/upload-excel', {
        method: 'POST',
        body: formData
      });
  
      fetchTasks();
    });
  
    async function fetchTasks() {
      try {
        const response = await fetch('http://localhost:3000/tasks');
        const tasks = await response.json();
        console.log('Fetched Tasks:', tasks); // Debugging line
  
        if (Array.isArray(tasks)) {
          taskList.innerHTML = tasks.map(task => `
            <div class="task">
              <h3>${task.name || 'No Name'}</h3>
              ${task.filePath ? `<a href="${task.filePath}" target="_blank">View PDF</a>` : '<p>No file attached</p>'}
            </div>
          `).join('');
        } else {
          taskList.innerHTML = '<p>No tasks found</p>';
        }
      } catch (error) {
        console.error('Error:', error);
        taskList.innerHTML = '<p>Error fetching tasks</p>';
      }
    }
  
    fetchTasks(); // Load tasks on page load
  });
  