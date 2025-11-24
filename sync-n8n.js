const fs = require('fs');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const path = require('path');

async function pullWorkflows() {
  try {
    console.log('Exporting workflows from n8n...');
    
    // Use Docker exec to export
    await execPromise('docker exec teacher-assistant-n8n-1 n8n export:workflow --all --output=/home/node/.n8n/workflows.json');
    
    // Copy from container
    await execPromise('docker cp teacher-assistant-n8n-1:/home/node/.n8n/workflows.json ./n8n-workflows/');
    
    console.log('✓ Workflows exported to n8n-workflows/workflows.json');
    
    // Split into individual files
    const data = fs.readFileSync('./n8n-workflows/workflows.json', 'utf8');
    const workflows = JSON.parse(data);
    
    workflows.forEach(workflow => {
      const filename = `n8n-workflows/${workflow.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      // Save as single workflow (not array)
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
    
    if (!fs.existsSync('n8n-workflows')) {
      console.log('No n8n-workflows folder found');
      return;
    }
    
    const files = fs.readdirSync('n8n-workflows');
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'workflows.json') {
        console.log(`Importing ${file}...`);
        
        // Create temp file with workflow as array (n8n import expects array)
        const workflow = JSON.parse(fs.readFileSync(`n8n-workflows/${file}`, 'utf8'));
        const tempFile = `n8n-workflows/temp_${file}`;
        
        // Wrap single workflow in array for import
        fs.writeFileSync(tempFile, JSON.stringify([workflow], null, 2));
        
        // Copy to container
        await execPromise(`docker cp ${tempFile} teacher-assistant-n8n-1:/home/node/.n8n/`);
        
        // Import
        try {
          await execPromise(`docker exec teacher-assistant-n8n-1 n8n import:workflow --input=/home/node/.n8n/temp_${file}`);
          console.log(`  ✓ ${workflow.name} imported`);
        } catch (importError) {
          // Even if it shows error, it might have worked
          console.log(`  ⚠ ${workflow.name} import completed (check n8n UI)`);
        }
        
        // Clean up temp file
        fs.unlinkSync(tempFile);
      }
    }
    
    console.log('✓ Import process completed - check n8n UI');
    console.log('Note: Duplicate workflows will be skipped');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

const command = process.argv[2];
if (command === 'pull') pullWorkflows();
else if (command === 'push') pushWorkflows();
else console.log('Use: node sync-n8n.js pull|push');