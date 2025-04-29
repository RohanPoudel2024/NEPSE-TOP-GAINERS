const express = require('express');
const cors = require('cors');
const { scrapeGainers, parseGainersHTML } = require('./app');

const app = express();
const PORT = process.env.PORT || 0; // Use 0 to find an available port

// Middleware
app.use(cors());  
app.use(express.json()); 
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
  res.json({ status: 'ok', timestamp: new Date() });
});

// Start server with dynamic port assignment
const server = app.listen(PORT, () => {
  const actualPort = server.address().port;
  console.log(`NEPSE API Server running on http://localhost:${actualPort}`);
});