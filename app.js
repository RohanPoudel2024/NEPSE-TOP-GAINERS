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
    console.log("Starting to scrape indices data...");
    // Make a request to the website
    const response = await axios.get('https://merolagani.com/LatestMarket.aspx');
    const html = response.data;
    
    // Parse HTML with cheerio
    const $ = cheerio.load(html);
    
    // Get the indices data
    const indices = [];
    console.log("Looking for index elements...");
    
    // Try different selector approaches
    $('#index-slider li.list-item').each((index, item) => {
      try {
        const $item = $(item);
        
        // Get the index name
        const name = $item.find('strong').text().trim();
        if (!name) return; // Skip if no name found
        
        // Determine if it's increasing or decreasing
        const isIncrease = $item.find('.text-increase').length > 0;
        const isDecrease = $item.find('.text-decrease').length > 0;
        const direction = isIncrease ? 'up' : (isDecrease ? 'down' : 'neutral');
        
        // Get the value
        let value = 0;
        const valueText = $item.find('.text-increase span:first, .text-decrease span:first').text().trim();
        if (valueText) {
          value = parseFloat(valueText.replace(/,/g, '')) || 0;
        }
        
        // Get percentage change
        let percentChange = 0;
        const percentText = $item.find('.text-increase span:last, .text-decrease span:last').text().trim();
        if (percentText) {
          percentChange = parseFloat(percentText.replace(/[^0-9.-]/g, '')) || 0;
          // Make it negative if it's decreasing
          if (isDecrease) {
            percentChange = -Math.abs(percentChange);
          }
        }
        
        // Get volume
        let volume = 0;
        const volumeText = $item.find('.text-primary').text().trim();
        if (volumeText) {
          // Remove parentheses and commas
          const cleaned = volumeText.replace(/[()]/g, '').replace(/,/g, '');
          volume = parseFloat(cleaned) || 0;
        }
        
        indices.push({
          name,
          value,
          percentChange,
          direction,
          volume
        });
        
        console.log(`Found index: ${name} = ${value} (${percentChange}%)`);
      } catch (err) {
        console.error(`Error parsing index item: ${err.message}`);
      }
    });
    
    console.log(`Total indices found: ${indices.length}`);
    
    // If no indices found with standard selector, try an alternative approach
    if (indices.length === 0) {
      console.log("No indices found with standard selector, trying alternative...");
      
      // Alternative approach to extract from HTML string directly
      const indexRegex = /<li class="list-item"><strong>([^<]+)<\/strong><span class="text-(increase|decrease)"><br><span>([0-9,.]+)<\/span>.*?<span>([0-9.]+)%<\/span><\/span><br><span class="text-primary">\(([0-9,.]+)\)<\/span><\/li>/g;
      
      let match;
      while ((match = indexRegex.exec(html)) !== null) {
        const name = match[1].trim();
        const direction = match[2] === 'increase' ? 'up' : 'down';
        const value = parseFloat(match[3].replace(/,/g, ''));
        let percentChange = parseFloat(match[4]);
        if (direction === 'down') {
          percentChange = -percentChange;
        }
        const volume = parseFloat(match[5].replace(/,/g, ''));
        
        indices.push({
          name,
          value,
          percentChange,
          direction,
          volume
        });
        
        console.log(`Found index via regex: ${name} = ${value} (${percentChange}%)`);
      }
      
      console.log(`Total indices found via regex: ${indices.length}`);
    }
    
    return {
      data: indices,
      timestamp: new Date().toISOString(),
      count: indices.length
    };
  } catch (error) {
    console.error('Error scraping indices data:', error.message);
    console.error(error.stack);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Replace the fetchIndexData function with this improved version

async function fetchIndexData() {
  try {
    console.log("Fetching index data directly with custom headers...");
    
    // Use better headers to mimic a real browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://merolagani.com/LatestMarket.aspx',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive'
    };
    
    // Try the direct ticker endpoint first
    const tickerResponse = await axios.get('https://merolagani.com/Modules/Ticker/NewsTicker.aspx', {
      headers
    });
    
    if (tickerResponse.data) {
      const $ = cheerio.load(tickerResponse.data);
      const indices = [];
      
      console.log("Processing indices from ticker data...");
      
      $('.list-sliding .list-item:not(.list-sliding-nav)').each((index, item) => {
        try {
          const $item = $(item);
          
          const name = $item.find('strong').text().trim();
          if (!name) return;
          
          const hasIncrease = $item.find('.text-increase').length > 0;
          const hasDecrease = $item.find('.text-decrease').length > 0;
          const direction = hasIncrease ? 'up' : (hasDecrease ? 'down' : 'neutral');
          
          let value = 0;
          let percentChange = 0;
          
          if (hasIncrease || hasDecrease) {
            const textClass = hasIncrease ? '.text-increase' : '.text-decrease';
            const $spans = $item.find(`${textClass} span`);
            
            if ($spans.length >= 1) {
              value = parseFloat($($spans[0]).text().replace(/,/g, '')) || 0;
            }
            
            if ($spans.length >= 2) {
              percentChange = parseFloat($($spans[$spans.length-1]).text().replace(/[^0-9.-]/g, '')) || 0;
              if (hasDecrease) {
                percentChange = -Math.abs(percentChange);
              }
            }
          }
          
          // Extract volume
          let volume = 0;
          const volumeText = $item.find('.text-primary').text().trim();
          if (volumeText) {
            const volumeMatch = volumeText.match(/\(([0-9,.]+)\)/);
            if (volumeMatch && volumeMatch[1]) {
              volume = parseFloat(volumeMatch[1].replace(/,/g, '')) || 0;
            }
          }
          
          indices.push({
            name,
            value,
            percentChange,
            direction,
            volume
          });
          
          console.log(`Found index: ${name} = ${value} (${percentChange}%)`);
        } catch (err) {
          console.error(`Error parsing index item: ${err.message}`);
        }
      });
      
      console.log(`Total indices found: ${indices.length}`);
      
      if (indices.length > 0) {
        return {
          data: indices,
          timestamp: new Date().toISOString(),
          count: indices.length
        };
      }
    }
    
    // If ticker endpoint failed, try the direct API approach
    console.log("Ticker endpoint did not return usable data, trying marketindices API...");
    const apiResponse = await axios.get('https://merolagani.com/handlers/webrequesthandler.ashx?type=marketindices', {
      headers
    });
    
    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      console.log("Got data from marketindices API");
      const indices = apiResponse.data.map(item => ({
        name: item.Index || item.Name || "Unknown",
        value: parseFloat(item.Value) || 0,
        percentChange: parseFloat(item.PercentChange) || 0,
        direction: parseFloat(item.PercentChange) >= 0 ? 'up' : 'down',
        volume: parseFloat(item.Volume || item.Turnover || 0)
      }));
      
      return {
        data: indices,
        timestamp: new Date().toISOString(),
        count: indices.length
      };
    }
    
    // As a last resort, try using regex on the main page HTML
    console.log("API approach failed, trying regex on main page...");
    const mainPageResponse = await axios.get('https://merolagani.com/', { headers });
    const html = mainPageResponse.data;
    
    // Look for the slider HTML
    const sliderMatch = html.match(/<ul id="index-slider".*?<\/ul>/s);
    if (sliderMatch) {
      console.log("Found index slider HTML via regex");
      return parseIndicesHTML(sliderMatch[0]);
    }
    
    console.log("All direct approaches failed, no indices data found");
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: "Could not retrieve indices data"
    };
  } catch (error) {
    console.error('Error in fetchIndexData:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
}

// Update the scrapeIndicesWithFallback function to include static fallback
async function scrapeIndicesWithFallback() {
  try {
    console.log("Starting indices scraping with fallback strategy...");
    
    // Try direct fetch method first as it's more reliable
    const directResult = await fetchIndexData();
    if (directResult.data && directResult.data.length > 0) {
      console.log("Direct fetch method succeeded, returning data");
      return directResult;
    }
    
    // If direct fetch failed, try the standard scraping method
    console.log("Direct fetch failed, trying standard scraping...");
    const standardResult = await scrapeIndices();
    if (standardResult.data && standardResult.data.length > 0) {
      console.log("Standard scraping succeeded, returning data");
      return standardResult;
    }
    
    // If all else fails, return static data
    console.log("All methods failed to retrieve indices data, using static fallback");
    return getStaticIndicesData();
  } catch (error) {
    console.error('Error in indices scraping with fallback:', error.message);
    // Return static data on any error
    return getStaticIndicesData();
  }
}

// Function to parse provided HTML snippet for market indices
function parseIndicesHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    
    // Get the indices data
    const indices = [];
    console.log("Parsing indices from provided HTML...");
    
    // Process each index in the list
    $('li.list-item').each((index, item) => {
      try {
        const $item = $(item);
        
        // Skip navigation items
        if ($item.hasClass('list-sliding-nav')) return;
        
        // Get the index name
        const name = $item.find('strong').text().trim();
        if (!name) return; // Skip if no name found
        
        // Determine if it's increasing or decreasing
        const isIncrease = $item.find('.text-increase').length > 0;
        const isDecrease = $item.find('.text-decrease').length > 0;
        const direction = isIncrease ? 'up' : (isDecrease ? 'down' : 'neutral');
        
        // Get the value
        let value = 0;
        const valueText = $item.find('.text-increase span:first, .text-decrease span:first').text().trim();
        if (valueText) {
          value = parseFloat(valueText.replace(/,/g, '')) || 0;
        }
        
        // Get percentage change
        let percentChange = 0;
        const percentText = $item.find('.text-increase span:last, .text-decrease span:last').text().trim();
        if (percentText) {
          percentChange = parseFloat(percentText.replace(/[^0-9.-]/g, '')) || 0;
          // Make it negative if it's decreasing
          if (isDecrease) {
            percentChange = -Math.abs(percentChange);
          }
        }
        
        // Get volume
        let volume = 0;
        const volumeText = $item.find('.text-primary').text().trim();
        if (volumeText) {
          // Remove parentheses and commas
          const cleaned = volumeText.replace(/[()]/g, '').replace(/,/g, '');
          volume = parseFloat(cleaned) || 0;
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
        console.error(`Error parsing index item: ${err.message}`);
      }
    });
    
    console.log(`Total indices parsed: ${indices.length}`);
    
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

// Also add this function to handle the specific HTML format you showed earlier
function parseProvidedIndicesHTML(htmlSnippet) {
  try {
    const $ = cheerio.load(htmlSnippet);
    const indices = [];
    
    $('ul#index-slider li.list-item').each((index, item) => {
      try {
        const $item = $(item);
        
        // Get index name
        const name = $item.find('strong').text().trim();
        if (!name) return;
        
        // Determine direction
        const hasIncrease = $item.find('.text-increase').length > 0;
        const hasDecrease = $item.find('.text-decrease').length > 0;
        const direction = hasIncrease ? 'up' : (hasDecrease ? 'down' : 'neutral');
        
        // Get values
        const valueSpan = $item.find('.text-increase span, .text-decrease span').first();
        const value = parseFloat(valueSpan.text().replace(/,/g, '')) || 0;
        
        // Get percentage
        const percentSpan = $item.find('.text-increase span, .text-decrease span').last();
        let percentChange = parseFloat(percentSpan.text().replace(/[^0-9.-]/g, '')) || 0;
        if (hasDecrease) {
          percentChange = -Math.abs(percentChange);
        }
        
        // Get volume
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
    console.error('Error parsing provided indices HTML:', error.message);
    return {
      data: [],
      timestamp: new Date().toISOString(),
      count: 0,
      error: error.message
    };
  }
  
}

// Fallback function with hardcoded indices data when all scraping fails
function getStaticIndicesData() {
  console.log("Using static indices data as fallback");
  
  return {
    data: [
      {
        name: "NEPSE",
        value: 2633.46,
        percentChange: 0.05,
        direction: "up",
        volume: 2061293722.58
      },
      {
        name: "Sensitive",
        value: 444.04,
        percentChange: 0.11,
        direction: "up",
        volume: 0
      },
      {
        name: "Float",
        value: 177.50,
        percentChange: 0.06,
        direction: "up",
        volume: 0
      },
      {
        name: "Sen. Float",
        value: 149.71,
        percentChange: 0.07,
        direction: "up",
        volume: 0
      },
      {
        name: "Banking",
        value: 1307.89,
        percentChange: -0.42,
        direction: "down",
        volume: 84169464.94
      },
      {
        name: "Development Bank",
        value: 5316.89,
        percentChange: -0.46,
        direction: "down",
        volume: 41115642.60
      },
      {
        name: "Hydropower",
        value: 3502.49,
        percentChange: 0.49,
        direction: "up",
        volume: 1557740209.40
      }
    ],
    timestamp: new Date().toISOString(),
    count: 7,
    note: "Using fallback static data - live scraping failed"
  };
}

// Export functions for use in server.js
module.exports = {
  scrapeGainers,
  parseGainersHTML,
  scrapeLiveTrading,
  parseLiveTradingHTML,
  scrapeIndices: scrapeIndicesWithFallback,
  parseIndicesHTML,
  parseProvidedIndicesHTML,
  fetchIndexData, // Add this so it's available in server.js
  getStaticIndicesData // Add this so it's available in server.js
};