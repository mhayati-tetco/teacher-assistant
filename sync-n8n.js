const fs = require('fs');
const axios = require('axios');

const N8N_URL = 'http://localhost:5678/api/v1';
const API_KEY = 'teamkey123';

// Export all workflows to JSON files
async function pullWorkflows() {
  try {
    const response = await axios.get(`${N8N_URL}/workflows`, {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    
    if (!fs.existsSync('n8n-workflows')) {
      fs.mkdirSync('n8n-workflows');
    }
    
    response.data.data.forEach(workflow => {
      fs.writeFileSync(
        `n8n-workflows/${workflow.name}.json`,
        JSON.stringify(workflow, null, 2)
      );
      console.log(`Exported: ${workflow.name}`);
    });
  } catch (error) {
    console.error('Error exporting:', error.message);
  }
}

// Import all JSON files to n8n
async function pushWorkflows() {
  try {
    const files = fs.readdirSync('n8n-workflows');
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const workflow = JSON.parse(fs.readFileSync(`n8n-workflows/${file}`));
        delete workflow.id; // Remove ID to create new
        
        await axios.post(`${N8N_URL}/workflows`, workflow, {
          headers: { 'X-N8N-API-KEY': API_KEY }
        });
        console.log(`Imported: ${file}`);
      }
    }
  } catch (error) {
    console.error('Error importing:', error.message);
  }
}

const command = process.argv[2];
if (command === 'pull') pullWorkflows();
else if (command === 'push') pushWorkflows();
else console.log('Use: node sync-n8n.js pull|push');