const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape gainers data from merolagani.com
async function scrapeGainers() {
  try {
    // Make a request to the website
    const response = await axios.get('https://merolagani.com/LatestMarket.aspx');
    const html = response.data;
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    const gainersTable = $('table[data-live="gainers"]');
    
    // Array to store the parsed data
    const gainers = [];
    
    // Process each row in the table (skip the header row)
    gainersTable.find('tr').each((index, row) => {
      if (index === 0) return; 
      
      const columns = $(row).find('td');
      
      // Extract data from each column
      const symbol = $(columns[0]).find('a').text().trim();
      const fullName = $(columns[0]).find('a').attr('title') || '';
      const ltp = parseFloat($(columns[1]).text().replace(/,/g, ''));
      const percentChange = parseFloat($(columns[2]).text());
      const high = parseFloat($(columns[3]).text().replace(/,/g, ''));
      const low = parseFloat($(columns[4]).text().replace(/,/g, ''));
      const open = parseFloat($(columns[5]).text().replace(/,/g, ''));
      const quantity = parseInt($(columns[6]).text().replace(/,/g, ''), 10);
      const turnover = parseFloat($(columns[7]).text().replace(/,/g, ''));
      
      gainers.push({
        symbol,
        fullName,
        ltp,
        percentChange,
        high,
        low,
        open,
        quantity,
        turnover
      });
    });
    
    return gainers;
  } catch (error) {
    console.error('Error scraping data:', error.message);
    return [];
  }
}

// Function to parse provided HTML snippet directly
function parseGainersHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    const gainers = [];
    
    $('table[data-live="gainers"] tr').each((index, row) => {
      if (index === 0) return; // Skip header row
      
      const columns = $(row).find('td');
      if (columns.length < 8) return;
      
      gainers.push({
        symbol: $(columns[0]).find('a').text().trim(),
        fullName: $(columns[0]).find('a').attr('title') || '',
        ltp: parseFloat($(columns[1]).text().replace(/,/g, '')),
        percentChange: parseFloat($(columns[2]).text()),
        high: parseFloat($(columns[3]).text().replace(/,/g, '')),
        low: parseFloat($(columns[4]).text().replace(/,/g, '')),
        open: parseFloat($(columns[5]).text().replace(/,/g, '')),
        quantity: parseInt($(columns[6]).text().replace(/,/g, ''), 10),
        turnover: parseFloat($(columns[7]).text().replace(/,/g, ''))
      });
    });
    
    return gainers;
  } catch (error) {
    console.error('Error parsing HTML:', error.message);
    return [];
  }
}

// Function to scrape live trading data from merolagani.com
async function scrapeLiveTrading() {
  try {
    // Make a request to the website
    const response = await axios.get('https://merolagani.com/LatestMarket.aspx');
    const html = response.data;
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    const liveTable = $('table.live-trading[data-live="live-trading"]');
    
    // Get the timestamp if available
    const dateLabel = $('.date-label span.label').text().trim();
    const timestamp = dateLabel || new Date().toISOString();
    
    // Array to store the parsed data
    const liveTrading = [];
    
    // Process each row in the table
    liveTable.find('tbody tr').each((index, row) => {
      const columns = $(row).find('td');
      if (columns.length < 9) return; // Skip if not enough columns
      
      // Check if it's an increase or decrease
      const changeType = $(row).hasClass('increase-row') ? 'increase' : 'decrease';
      
      // Extract data from each column
      const symbol = $(columns[0]).find('a').text().trim();
      const fullName = $(columns[0]).find('a').attr('title') || '';
      const ltp = parseFloat($(columns[1]).text().replace(/,/g, ''));
      const percentChange = parseFloat($(columns[2]).text());
      const open = parseFloat($(columns[3]).text().replace(/,/g, ''));
      const high = parseFloat($(columns[4]).text().replace(/,/g, ''));
      const low = parseFloat($(columns[5]).text().replace(/,/g, ''));
      const quantity = parseInt($(columns[6]).text().replace(/,/g, ''), 10);
      const pclose = parseFloat($(columns[7]).text().replace(/,/g, ''));
      const diff = parseFloat($(columns[8]).text().replace(/,/g, ''));
      
      liveTrading.push({
        symbol,
        fullName,
        ltp,
        percentChange,
        open,
        high,
        low,
        quantity,
        pclose,
        diff,
        changeType
      });
    });
    
    return {
      data: liveTrading,
      timestamp,
      count: liveTrading.length
    };
  } catch (error) {
    console.error('Error scraping live trading data:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Function to parse provided HTML snippet for live trading
function parseLiveTradingHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    
    // Get the timestamp if available
    const dateLabel = $('.date-label span.label').text().trim();
    const timestamp = dateLabel || new Date().toISOString();
    
    // Array to store the parsed data
    const liveTrading = [];
    
    // Process each row in the table
    $('table.live-trading tbody tr').each((index, row) => {
      const columns = $(row).find('td');
      if (columns.length < 9) return; // Skip if not enough columns
      
      // Check if it's an increase or decrease
      const changeType = $(row).hasClass('increase-row') ? 'increase' : 'decrease';
      
      // Extract data from each column
      const symbol = $(columns[0]).find('a').text().trim();
      const fullName = $(columns[0]).find('a').attr('title') || '';
      const ltp = parseFloat($(columns[1]).text().replace(/,/g, ''));
      const percentChange = parseFloat($(columns[2]).text());
      const open = parseFloat($(columns[3]).text().replace(/,/g, ''));
      const high = parseFloat($(columns[4]).text().replace(/,/g, ''));
      const low = parseFloat($(columns[5]).text().replace(/,/g, ''));
      const quantity = parseInt($(columns[6]).text().replace(/,/g, ''), 10);
      const pclose = parseFloat($(columns[7]).text().replace(/,/g, ''));
      const diff = parseFloat($(columns[8]).text().replace(/,/g, ''));
      
      liveTrading.push({
        symbol,
        fullName,
        ltp,
        percentChange,
        open,
        high,
        low,
        quantity,
        pclose,
        diff,
        changeType
      });
    });
    
    return {
      data: liveTrading,
      timestamp,
      count: liveTrading.length
    };
  } catch (error) {
    console.error('Error parsing live trading HTML:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Function to scrape indices data from merolagani.com
async function scrapeIndices() {
  try {
    // Make a request to the website
    const response = await axios.get('https://merolagani.com/LatestMarket.aspx');
    const html = response.data;
    return parseIndicesHTML(html);
  } catch (error) {
    console.error('Error scraping indices data:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Function to parse provided HTML snippet for market indices
function parseIndicesHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    
    // Get the indices data
    const indices = [];
    
    // Process each index in the slider
    $('#index-slider li.list-item').each((index, item) => {
      const $item = $(item);
      
      // Get the index name
      const name = $item.find('strong').text().trim();
      
      // Determine if it's increasing or decreasing
      const isIncrease = $item.find('span').hasClass('text-increase');
      const isDecrease = $item.find('span').hasClass('text-decrease');
      const direction = isIncrease ? 'up' : (isDecrease ? 'down' : 'neutral');
      
      // Get the value and percentage change
      const valueSpan = $item.find('span > span').first().text().trim();
      const value = parseFloat(valueSpan.replace(/,/g, ''));
      
      const percentChangeSpan = $item.find('span > span').last().text().trim();
      const percentChange = parseFloat(percentChangeSpan.replace(/[^0-9.-]/g, '')) * (direction === 'down' ? -1 : 1);
      
      // Get the volume/value in parentheses
      const volumeText = $item.find('span.text-primary').text().trim();
      const volume = parseFloat(volumeText.replace(/[^\d.-]/g, '')) || 0;
      
      indices.push({
        name,
        value,
        percentChange,
        direction,
        volume
      });
    });
    
    return {
      data: indices,
      timestamp: new Date().toISOString(),
      count: indices.length
    };
  } catch (error) {
    console.error('Error parsing indices HTML:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Export functions for use in server.js
module.exports = {
  scrapeGainers,
  parseGainersHTML,
  scrapeLiveTrading,
  parseLiveTradingHTML,
  scrapeIndices,
  parseIndicesHTML
};