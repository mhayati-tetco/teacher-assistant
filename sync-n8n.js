const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function pullWorkflows() {
  try {
    console.log('Exporting workflows from n8n...');
    
    // Use Docker exec to export
    await execPromise('docker exec teacher-assistant-n8n-1 n8n export:workflow --all --output=/home/node/.n8n/workflows.json');
    
    // Copy from container
    await execPromise('docker cp teacher-assistant-n8n-1:/home/node/.n8n/workflows.json ./n8n-workflows/');
    
    console.log('✓ Workflows exported to n8n-workflows/workflows.json');
    
    // Optional: Split into individual files
    const data = fs.readFileSync('./n8n-workflows/workflows.json', 'utf8');
    const workflows = JSON.parse(data);
    
    workflows.forEach(workflow => {
      const filename = `n8n-workflows/${workflow.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      fs.writeFileSync(filename, JSON.stringify(workflow, null, 2));
      console.log(`  - ${workflow.name}.json`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function pushWorkflows() {
  try {
    console.log('Importing workflows to n8n...');
    
    // Copy workflows.json to container
    await execPromise('docker cp ./n8n-workflows/workflows.json teacher-assistant-n8n-1:/home/node/.n8n/');
    
    // Import using Docker exec
    await execPromise('docker exec teacher-assistant-n8n-1 n8n import:workflow --input=/home/node/.n8n/workflows.json');
    
    console.log('✓ Workflows imported successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const command = process.argv[2];
if (command === 'pull') pullWorkflows();
else if (command === 'push') pushWorkflows();
else console.log('Use: node sync-n8n.js pull|push');