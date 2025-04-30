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
async function scrapeIndicesFromNepaliPaisa() {
  try {
    console.log("Scraping indices data from NepaliPaisa.com...");
    // Make a request to the website
    const response = await axios.get('https://nepalipaisa.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    const indices = [];
    
    // Process each item in the content-slider
    $('#content-slider li').each((index, item) => {
      try {
        // Skip clone items to avoid duplicates
        if ($(item).hasClass('clone')) return;
        
        const $item = $(item);
        
        // Get index name
        const name = $item.find('h6').text().trim();
        if (!name) return;
        
        // Get value from p element
        const valueText = $item.find('p:not(.change)').text().trim();
        const value = parseFloat(valueText.replace(/,/g, '')) || 0;
        
        // Determine direction and get change value
        const hasGainer = $item.find('.gainer').length > 0;
        const hasLooser = $item.find('.looser').length > 0;
        const direction = hasGainer ? 'up' : (hasLooser ? 'down' : 'neutral');
        
        // Get percentage and change amount
        const changeText = $item.find('p.change').text().trim();
        const percentText = $item.find('span').text().replace(changeText, '').trim();
        
        // Extract numerical values
        let change = parseFloat(changeText.replace(/[^0-9.-]/g, '')) || 0;
        if (changeText.includes('-')) change = -Math.abs(change);
        
        let percentChange = 0;
        const percentMatch = percentText.match(/\(([^)]+)\)/);
        if (percentMatch) {
          percentChange = parseFloat(percentMatch[1].replace(/[^0-9.-]/g, '')) || 0;
          // Make sure the sign is correct
          if (percentText.includes('-')) percentChange = -Math.abs(percentChange);
        }
        
        // No volume data is available in this source, set to 0
        const volume = 0;
        
        indices.push({
          name,
          value,
          percentChange,
          change,
          direction,
          volume
        });
        
        console.log(`Parsed index from NepaliPaisa: ${name} = ${value} (${percentChange}%)`);
      } catch (err) {
        console.error(`Error parsing specific index from NepaliPaisa: ${err.message}`);
      }
    });
    
    // Remove duplicates (because of the slider's structure)
    const uniqueIndices = [];
    const seen = new Set();
    
    for (const index of indices) {
      if (!seen.has(index.name)) {
        seen.add(index.name);
        uniqueIndices.push(index);
      }
    }
    
    return {
      data: uniqueIndices,
      timestamp: new Date().toISOString(),
      count: uniqueIndices.length,
      source: 'NepaliPaisa.com'
    };
  } catch (error) {
    console.error('Error scraping indices data from NepaliPaisa:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message,
      source: 'NepaliPaisa.com'
    };
  }
}

// Function to parse HTML snippet from NepaliPaisa
function parseIndicesHTMLFromNepaliPaisa(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    const indices = [];
    
    // Process each item in the content-slider
    $('li').each((index, item) => {
      try {
        // Skip clone items to avoid duplicates
        if ($(item).hasClass('clone')) return;
        
        const $item = $(item);
        
        // Get index name
        const name = $item.find('h6').text().trim();
        if (!name) return;
        
        // Get value from p element
        const valueText = $item.find('p:not(.change)').text().trim();
        const value = parseFloat(valueText.replace(/,/g, '')) || 0;
        
        // Determine direction and get change value
        const hasGainer = $item.find('.gainer').length > 0;
        const hasLooser = $item.find('.looser').length > 0;
        const direction = hasGainer ? 'up' : (hasLooser ? 'down' : 'neutral');
        
        // Get percentage and change amount
        const changeText = $item.find('p.change').text().trim();
        const percentText = $item.find('span').text().replace(changeText, '').trim();
        
        // Extract numerical values
        let change = parseFloat(changeText.replace(/[^0-9.-]/g, '')) || 0;
        if (changeText.includes('-')) change = -Math.abs(change);
        
        let percentChange = 0;
        const percentMatch = percentText.match(/\(([^)]+)\)/);
        if (percentMatch) {
          percentChange = parseFloat(percentMatch[1].replace(/[^0-9.-]/g, '')) || 0;
          // Make sure the sign is correct
          if (percentText.includes('-')) percentChange = -Math.abs(percentChange);
        }
        
        indices.push({
          name,
          value,
          percentChange,
          change,
          direction,
          volume: 0 // No volume data in this source
        });
        
        console.log(`Parsed index from NepaliPaisa HTML: ${name} = ${value} (${percentChange}%)`);
      } catch (err) {
        console.error(`Error parsing specific index from NepaliPaisa HTML: ${err.message}`);
      }
    });
    
    // Remove duplicates
    const uniqueIndices = [];
    const seen = new Set();
    
    for (const index of indices) {
      if (!seen.has(index.name)) {
        seen.add(index.name);
        uniqueIndices.push(index);
      }
    }
    
    return {
      data: uniqueIndices,
      timestamp: new Date().toISOString(),
      count: uniqueIndices.length,
      source: 'NepaliPaisa.com'
    };
  } catch (error) {
    console.error('Error parsing NepaliPaisa HTML:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message,
      source: 'NepaliPaisa.com'
    };
  }
}

// Function to parse provided HTML snippet for market indices
function parseIndicesHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    const indices = [];
    
    // Find each index item in the slider (skip navigation elements)
    $('ul#index-slider li.list-item').each((index, item) => {
      try {
        const $item = $(item);
        
        // Get index name
        const name = $item.find('strong').text().trim();
        if (!name) return;
        
        // Determine direction
        const isDecrease = $item.find('.text-decrease').length > 0;
        const isIncrease = $item.find('.text-increase').length > 0;
        const direction = isIncrease ? 'up' : (isDecrease ? 'down' : 'neutral');
        
        // Get value (first span inside text-decrease/text-increase)
        const valueSpan = $item.find('.text-decrease span, .text-increase span').first();
        const value = parseFloat(valueSpan.text().replace(/,/g, '')) || 0;
        
        // Get percentage change (last span)
        const percentSpan = $item.find('.text-decrease span, .text-increase span').last();
        let percentText = percentSpan.text().trim();
        let percentChange = parseFloat(percentText.replace(/[^0-9.-]/g, '')) || 0;
        
        // Make it negative for decrease
        if (isDecrease) {
          percentChange = -Math.abs(percentChange);
        }
        
        // Get volume from text-primary (inside parentheses)
        const volumeText = $item.find('.text-primary').text().trim();
        const volumeMatch = volumeText.match(/\(([0-9,.]+)\)/);
        let volume = 0;
        if (volumeMatch && volumeMatch[1]) {
          volume = parseFloat(volumeMatch[1].replace(/,/g, '')) || 0;
        }
        
        indices.push({
          name,
          value,
          percentChange,
          direction,
          volume
        });
        
        console.log(`Parsed index: ${name} = ${value} (${percentChange}%)`);
      } catch (err) {
        console.error(`Error parsing specific index: ${err.message}`);
      }
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

// Also add this function for manual parsing
function parseProvidedIndicesHTML(htmlSnippet) {
  try {
    // Use the general parseIndicesHTML function for MeroLagani HTML
    if (htmlSnippet.includes('index-slider')) {
      return parseIndicesHTML(htmlSnippet);
    }
    
    // Otherwise try to parse as NepaliPaisa HTML
    const $ = cheerio.load(htmlSnippet);
    const indices = [];
    
    // First try NepaliPaisa format
    $('li').each((index, item) => {
      try {
        const $item = $(item);
        
        // Skip clone items
        if ($item.hasClass('clone')) return;
        
        // Get index name from h6
        const name = $item.find('h6').text().trim();
        if (!name) return;
        
        // Check if we have NepaliPaisa format with gainer/looser div
        if ($item.find('.gainer, .looser').length > 0) {
          const hasGainer = $item.find('.gainer').length > 0;
          const direction = hasGainer ? 'up' : 'down';
          
          const valueText = $item.find('p:not(.change)').text().trim();
          const value = parseFloat(valueText.replace(/,/g, '')) || 0;
          
          const changeText = $item.find('p.change').text().trim();
          const percentText = $item.find('span').text().replace(changeText, '').trim();
          
          let change = parseFloat(changeText.replace(/[^0-9.-]/g, '')) || 0;
          if (changeText.includes('-') || !hasGainer) change = -Math.abs(change);
          
          let percentChange = 0;
          const percentMatch = percentText.match(/\(([^)]+)\)/);
          if (percentMatch) {
            percentChange = parseFloat(percentMatch[1].replace(/[^0-9.-]/g, '')) || 0;
            if (percentText.includes('-') || !hasGainer) percentChange = -Math.abs(percentChange);
          }
          
          indices.push({
            name,
            value,
            percentChange,
            change,
            direction,
            volume: 0
          });
        }
      } catch (err) {
        console.error(`Error parsing specific index item: ${err.message}`);
      }
    });
    
    if (indices.length > 0) {
      return {
        data: indices,
        timestamp: new Date().toISOString(),
        count: indices.length,
        source: 'Manual parsing'
      };
    }
    
    // If all else fails, return empty array
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: "Could not parse HTML - unknown format"
    };
  } catch (error) {
    console.error('Error in parseProvidedIndicesHTML:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Function to scrape indices data - prioritizing NepaliPaisa
async function scrapeIndices() {
  try {
    console.log("Attempting to scrape indices data...");
    
    // Try NepaliPaisa as primary source
    console.log("Fetching indices data from NepaliPaisa...");
    const nepaliPaisaResult = await scrapeIndicesFromNepaliPaisa();
    if (nepaliPaisaResult.data && nepaliPaisaResult.data.length > 0) {
      console.log(`Successfully parsed ${nepaliPaisaResult.data.length} indices from NepaliPaisa`);
      return nepaliPaisaResult;
    }
    
    console.log("Failed to get indices data from NepaliPaisa, returning empty result");
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: "Failed to retrieve indices data",
      source: 'NepaliPaisa.com'
    };
  } catch (error) {
    console.error('Error in scraping indices:', error.message);
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
  parseIndicesHTML,
  parseProvidedIndicesHTML,
  scrapeIndicesFromNepaliPaisa,
  parseIndicesHTMLFromNepaliPaisa
};