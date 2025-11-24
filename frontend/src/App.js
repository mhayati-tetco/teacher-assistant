import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [text, setText] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Direct Groq API call
  const testGroqDirect = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: text }],
          max_tokens: 200
        },
        {
          headers: {  
            'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setResponse(result.data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error: ' + error.message);
    }
    setLoading(false);
  };
  
  // n8n webhook call
  const testN8nWebhook = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        'http://localhost:5678/webhook/test-groq',
        {
          text: text
        }
      );
      setResponse(result.data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error: Check if n8n workflow is active');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Teacher Assistant Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask something... e.g., 'Explain photosynthesis for grade 5'"
          style={{ 
            width: '400px', 
            padding: '10px', 
            fontSize: '16px',
            marginRight: '10px'
          }}
        />
        
        <button 
          onClick={testGroqDirect}
          disabled={loading || !text}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            marginRight: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Groq Direct
        </button>
        
        <button 
          onClick={testN8nWebhook}
          disabled={loading || !text}
          style={{ 
            padding: '10px 20px', 
            fontSize: '16px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test via n8n
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {response && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }}>
          <h3>Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;