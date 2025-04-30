const express = require('express');
const cors = require('cors');
const { scrapeGainers, parseGainersHTML } = require('./app');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());  
app.use(express.json()); 

// Add route to show API info
app.get('/', (req, res) => {
  res.send(`
    <h1>NEPSE API</h1>
    <p>API is running successfully!</p>
    <ul>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/api/gainers">Get Gainers Data</a></li>
    </ul>
  `);
});

// API Routes
app.get('/api/gainers', async (req, res) => {
  try {
    const gainers = await scrapeGainers();
    res.json({
      success: true,
      data: gainers,
      count: gainers.length,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Route to parse HTML provided in the request
app.post('/api/parse', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    const gainers = parseGainersHTML(req.body.html);
    res.json({
      success: true,
      data: gainers,
      count: gainers.length,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    host: req.headers.host,
    timestamp: new Date() 
  });
});

// Function to keep the app alive - Modified for better reliability
function setupKeepAlive() {
  // Wait 30 seconds before starting the keep-alive mechanism
  setTimeout(() => {
    // Get the host from the server instance
    const server = app.listen(PORT, () => {
      const host = server.address().address;
      const port = server.address().port;
      const appUrl = `http://${host === '::' ? 'localhost' : host}:${port}`;
      
      console.log(`NEPSE API Server running at ${appUrl}`);
      
      // Set up the keep-alive interval
      setInterval(async () => {
        try {
          const response = await axios.get(`${appUrl}/health`);
          console.log(`[${new Date().toISOString()}] Keep-alive ping: ${response.status}`);
        } catch (error) {
          console.error('Keep-alive ping failed:', error.message);
        }
      }, 280000); // Every 4 minutes 40 seconds
    });
  }, 30000); // 30-second delay
}

// Start server - Use this approach instead of the previous one
app.listen(PORT, () => {
  console.log(`NEPSE API Server running on port ${PORT}`);
});

// Set up keep-alive function
setupKeepAlive();