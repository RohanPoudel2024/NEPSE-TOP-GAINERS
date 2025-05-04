const express = require('express');
const cors = require('cors');
const { 
  scrapeGainers, 
  parseGainersHTML, 
  scrapeLiveTrading, 
  parseLiveTradingHTML,
  scrapeIndices,
  parseIndicesHTML,
  parseProvidedIndicesHTML,
  scrapeIndicesFromNepaliPaisa,
  parseIndicesHTMLFromNepaliPaisa,
  scrapeFloorsheetData
} = require('./app');
const { scrapeCompanyDetails } = require('./companyDetails');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(cors());  
app.use(express.json()); 

// Add route to show API info
app.get("/", (req, res) => {
  res.send(`
    <h1>NEPSE API</h1>
    <p>API is running successfully!</p>
    <ul>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/api/gainers">Get Gainers Data</a></li>
      <li><a href="/api/live-trading">Get Live Trading Data</a></li>
      <li><a href="/api/indices">Get Market Indices Data</a></li>
      <li><a href="/api/company/HLI">Get Company Details (example: HLI)</a></li>
      <li><a href="/api/floorsheet/HLI">Get Floorsheet Data (example: HLI)</a></li>
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
    
    const result = parseIndicesHTML(req.body.html);
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

// Route to get indices data specifically from NepaliPaisa
app.get('/api/indices/nepalipaisa', async (req, res) => {
  try {
    const indicesData = await scrapeIndicesFromNepaliPaisa();
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

// Route to parse NepaliPaisa HTML directly
app.post('/api/parse/nepalipaisa-indices', (req, res) => {
  try {
    if (!req.body.html) {
      return res.status(400).json({
        success: false,
        error: 'HTML content is required',
        timestamp: new Date()
      });
    }
    
    const result = parseIndicesHTMLFromNepaliPaisa(req.body.html);
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

// Route to get company details
app.get('/api/company/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Stock symbol is required',
        timestamp: new Date()
      });
    }
    
    console.log(`Processing company details request for symbol: ${symbol}`);
    const companyData = await scrapeCompanyDetails(symbol);
    
    if (!companyData.success) {
      return res.status(404).json({
        success: false,
        error: companyData.error || `Could not retrieve details for ${symbol}`,
        timestamp: new Date()
      });
    }
    
    return res.json({
      success: true,
      data: companyData.data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(`Error processing company details request:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unknown error occurred',
      timestamp: new Date()
    });
  }
});

// Route to get company floorsheet data
app.get('/api/floorsheet/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Stock symbol is required',
        timestamp: new Date()
      });
    }
    
    console.log(`Processing floorsheet request for symbol: ${symbol}`);
    const floorsheetData = await scrapeFloorsheetData(symbol);
    
    if (!floorsheetData.success) {
      return res.status(404).json({
        success: false,
        error: floorsheetData.error || `Could not retrieve floorsheet data for ${symbol}`,
        timestamp: new Date()
      });
    }
    
    // Make sure this return statement is included
    return res.json({
      success: true,
      data: floorsheetData.data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error(`Error processing floorsheet request:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unknown error occurred',
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