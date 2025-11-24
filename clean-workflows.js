// clean-workflows.js
const fs = require('fs');

const files = fs.readdirSync('n8n-workflows');
files.forEach(file => {
  if (file.endsWith('.json')) {
    let content = fs.readFileSync(`n8n-workflows/${file}`, 'utf8');
    // Replace your API key with placeholder
    content = content.replace(/gsk_[a-zA-Z0-9]+/g, 'YOUR_GROQ_API_KEY');
    fs.writeFileSync(`n8n-workflows/${file}`, content);
    console.log(`Cleaned: ${file}`);
  }
});