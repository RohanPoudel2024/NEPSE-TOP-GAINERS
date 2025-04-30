const express = require('express');
const cors = require('cors');
const { 
  scrapeGainers, 
  parseGainersHTML, 
  scrapeLiveTrading, 
  parseLiveTradingHTML,
  scrapeIndices,
  parseIndicesHTML,
  parseProvidedIndicesHTML
} = require('./app');
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
      <li><a href="/api/live-trading">Get Live Trading Data</a></li>
      <li><a href="/api/indices">Get Market Indices Data</a></li>
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

// API Route for live trading
app.get('/api/live-trading', async (req, res) => {
  try {
    const tradingData = await scrapeLiveTrading();
    res.json({
      success: true,
      ...tradingData,
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

// New API Route for market indices
app.get('/api/indices', async (req, res) => {
  try {
    const indicesData = await scrapeIndices();
    res.json({
      success: true,
      ...indicesData,
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

// Direct market indices fetch endpoint
app.get('/api/indices-direct', async (req, res) => {
  try {
    // Make sure fetchIndexData is available
    if (typeof fetchIndexData !== 'function') {
      throw new Error('fetchIndexData function is not defined');
    }
    
    const indicesData = await fetchIndexData();
    res.json({
      success: true,
      ...indicesData,
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

// Route to parse HTML for live trading
app.post('/api/parse/live-trading', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    const tradingData = parseLiveTradingHTML(req.body.html);
    res.json({
      success: true,
      ...tradingData,
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

// New Route to parse HTML for indices
app.post('/api/parse/indices', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    const indicesData = parseIndicesHTML(req.body.html);
    res.json({
      success: true,
      ...indicesData,
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

// Direct parse endpoint for testing
app.post('/api/parse/direct-indices', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    const indicesData = parseProvidedIndicesHTML(req.body.html);
    res.json({
      success: true,
      ...indicesData,
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

// Direct parse endpoint for the provided HTML snippet
app.post('/api/parse/manual-indices', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    // Parse the provided HTML directly
    const result = parseProvidedIndicesHTML(req.body.html);
    
    res.json({
      success: true,
      ...result,
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

// Function to keep the app alive
function setupKeepAlive(appUrl) {
  setInterval(async () => {
    try {
      const response = await axios.get(`${appUrl}/health`);
      console.log(`[${new Date().toISOString()}] Keep-alive ping: ${response.status}`);
    } catch (error) {
      console.error('Keep-alive ping failed:', error.message);
    }
  }, 280000); // Every 4 minutes 40 seconds
}

// Start server
const server = app.listen(PORT, () => {
  console.log(`NEPSE API Server running on port ${PORT}`);
  
  // Determine the server URL
  let appUrl;
  if (process.env.RENDER_EXTERNAL_URL) {
    appUrl = process.env.RENDER_EXTERNAL_URL;
  } else {
    const host = server.address().address;
    const port = server.address().port;
    appUrl = `http://${host === '::' ? 'localhost' : host}:${port}`;
  }
  
  console.log(`Server URL: ${appUrl}`);
  
  // Start keep-alive after 30 seconds
  setTimeout(() => {
    setupKeepAlive(appUrl);
  }, 30000);
});