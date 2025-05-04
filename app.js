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

// Enhanced floorsheet data scraping function with reliable sources
async function scrapeFloorsheetData(symbol) {
  try {
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }
    
    symbol = symbol.toUpperCase();
    console.log(`Attempting to scrape floorsheet data for ${symbol} from sources...`);
    
    // Try sources in sequence until we get data - removed NepseAlpha
    const sources = [
      { name: 'MeroLagani Direct', fn: fetchMeroLaganiDirectFloorsheet },
      { name: 'ShareSansar', fn: fetchShareSansarFloorsheet },
      { name: 'Historical Data', fn: fetchHistoricalFloorsheet }
    ];
    
    let lastError = null;
    
    // Try each source until one succeeds
    for (const source of sources) {
      try {
        console.log(`Trying ${source.name} source for ${symbol}...`);
        const result = await source.fn(symbol);
        
        // If we got transactions or a valid result, return it
        if (result && result.success && result.data && 
            (result.data.floorsheet.length > 0 || result.data.message)) {
          console.log(`Successfully got data from ${source.name} with ${result.data.floorsheet.length} transactions`);
          return result;
        }
        
        console.log(`${source.name} returned no transactions, trying next source...`);
      } catch (error) {
        console.error(`Error from ${source.name}:`, error.message);
        lastError = error;
      }
    }
    
    // If all sources failed, return a default response
    return createEmptyFloorsheetResponse(symbol, symbol, "No floorsheet data could be retrieved from any source");
    
  } catch (error) {
    console.error(`General error in floorsheet scraping for ${symbol}:`, error.message);
    return {
      success: false,
      error: `Failed to fetch floorsheet data: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

// MeroLagani Direct Approach - Fixed to filter by company symbol
async function fetchMeroLaganiDirectFloorsheet(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching from MeroLagani CompanyDetail page for ${symbol}...`);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };
    
    // Use company-specific floorsheet URL instead of general page
    const companyFloorsheetUrl = `https://merolagani.com/CompanyFloorSheet.aspx?symbol=${symbol}`;
    console.log(`Requesting company-specific floorsheet from: ${companyFloorsheetUrl}`);
    
    const response = await axios.get(companyFloorsheetUrl, requestOptions);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Get company name
    const companyName = $('#ctl00_ContentPlaceHolder1_CompanyDetail1_companyName').text().trim() || 
                       $('.company-title').text().trim() || symbol;
    
    console.log(`Found company name: ${companyName}`);
    
    // Verify this is the correct company page
    if ($('body').text().toLowerCase().includes(`no floorsheet found for ${symbol.toLowerCase()}`)) {
      console.log(`No floorsheet found for ${symbol}`);
      return createEmptyFloorsheetResponse(symbol, companyName);
    }
    
    // Process the floorsheet table
    const floorsheetTable = $('table.table-bordered');
    if (floorsheetTable.length) {
      const transactions = [];
      
      floorsheetTable.find('tbody tr').each((index, row) => {
        try {
          const cells = $(row).find('td');
          if (cells.length >= 6) {
            // Verify this is a valid data row
            if ($(cells[0]).text().trim() === "") return;
            
            // Extract data carefully
            const sn = parseInt($(cells[0]).text().trim()) || index + 1;
            const contractNo = $(cells[1]).text().trim();
            // For company-specific page, buyer is at index 2 and seller at index 3
            const buyer = parseInt($(cells[2]).text().trim()) || 0;
            const seller = parseInt($(cells[3]).text().trim()) || 0;
            const quantity = parseNumberValue($(cells[4]).text().trim());
            const rate = parseNumberValue($(cells[5]).text().trim());
            const amount = cells.length > 6 ? 
              parseNumberValue($(cells[6]).text().trim()) : 
              (quantity * rate);
            
            // Only include rows with valid data
            if (quantity > 0 && rate > 0) {
              transactions.push({
                sn,
                contract_no: contractNo,
                stockholder: symbol,
                buyer,
                seller,
                quantity,
                rate,
                amount
              });
            }
          }
        } catch (err) {
          console.error(`Error parsing row ${index}:`, err.message);
        }
      });
      
      if (transactions.length > 0) {
        const summary = calculateFloorsheetSummary(transactions);
        
        return {
          success: true,
          data: {
            symbol,
            companyName,
            floorsheetDate: new Date().toISOString().split('T')[0],
            totalRecords: transactions.length,
            floorsheet: transactions,
            summary,
            source: 'MeroLagani Company-Specific'
          },
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // If the company-specific page didn't give results, try the general page with filtering
    console.log(`No transactions found in company page, trying general floorsheet with filtering...`);
    
    // Get general floorsheet and filter by the symbol
    const generalResponse = await axios.get(`https://merolagani.com/Floorsheet.aspx`, requestOptions);
    const generalHtml = generalResponse.data;
    const $general = cheerio.load(generalHtml);
    
    // Find the floorsheet table
    const generalTable = $general('table.table-bordered');
    if (generalTable.length) {
      const transactions = [];
      
      generalTable.find('tbody tr').each((index, row) => {
        try {
          const cells = $general(row).find('td');
          
          // General floorsheet includes company symbol at index 2
          if (cells.length >= 7) {
            const stockSymbol = $general(cells[2]).text().trim();
            
            // Only include rows for the requested symbol
            if (stockSymbol.toUpperCase() === symbol) {
              const sn = parseInt($general(cells[0]).text().trim()) || index + 1;
              const contractNo = $general(cells[1]).text().trim();
              const buyer = parseInt($general(cells[3]).text().trim()) || 0;
              const seller = parseInt($general(cells[4]).text().trim()) || 0;
              const quantity = parseNumberValue($general(cells[5]).text().trim());
              const rate = parseNumberValue($general(cells[6]).text().trim());
              const amount = cells.length > 7 ? 
                parseNumberValue($general(cells[7]).text().trim()) : 
                (quantity * rate);
              
              transactions.push({
                sn,
                contract_no: contractNo,
                stockholder: symbol,
                buyer,
                seller,
                quantity,
                rate,
                amount
              });
            }
          }
        } catch (err) {
          console.error(`Error parsing general floorsheet row ${index}:`, err.message);
        }
      });
      
      if (transactions.length > 0) {
        const summary = calculateFloorsheetSummary(transactions);
        
        return {
          success: true,
          data: {
            symbol,
            companyName,
            floorsheetDate: new Date().toISOString().split('T')[0],
            totalRecords: transactions.length,
            floorsheet: transactions,
            summary,
            source: 'MeroLagani Filtered'
          },
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Return empty response if no data found
    return createEmptyFloorsheetResponse(symbol, companyName);
    
  } catch (error) {
    console.error('Error in MeroLagani Direct approach:', error.message);
    throw error;
  }
}

// ShareSansar Source - Fixed to filter by company symbol
async function fetchShareSansarFloorsheet(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching from ShareSansar for ${symbol}...`);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };
    
    // Try company-specific floorsheet page first
    const response = await axios.get(`https://www.sharesansar.com/company-floorsheet?symbol=${symbol.toLowerCase()}`, requestOptions);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Get company name
    const companyName = $('.panel-title').text().trim() || symbol;
    
    // Find floorsheet table
    const floorsheetTable = $('.table-bordered');
    
    if (floorsheetTable.length) {
      const transactions = [];
      
      // Check if we have data or "No records found" message
      const noRecords = $('td:contains("No records found")').length > 0;
      if (noRecords) {
        console.log('ShareSansar reports no records found');
        return createEmptyFloorsheetResponse(symbol, companyName);
      }
      
      floorsheetTable.find('tbody tr').each((index, row) => {
        try {
          const cells = $(row).find('td');
          
          // Skip rows without enough cells
          if (cells.length < 6) return;
          
          // Verify that this row has actual data
          const contractText = $(cells[1]).text().trim();
          if (!contractText || contractText === '-' || contractText.length < 5) return;
          
          const sn = parseInt($(cells[0]).text().trim()) || index + 1;
          const contractNo = contractText;
          const buyer = parseInt($(cells[2]).text().trim()) || 0;
          const seller = parseInt($(cells[3]).text().trim()) || 0;
          const quantity = parseNumberValue($(cells[4]).text().trim());
          const rate = parseNumberValue($(cells[5]).text().trim());
          const amount = cells.length > 6 ? 
            parseNumberValue($(cells[6]).text().trim()) : 
            (quantity * rate);
          
          // Validate the data before adding
          if (quantity > 0 && rate > 0) {
            transactions.push({
              sn,
              contract_no: contractNo,
              stockholder: symbol,
              buyer,
              seller,
              quantity,
              rate,
              amount
            });
          }
        } catch (err) {
          console.error(`Error parsing ShareSansar row ${index}:`, err.message);
        }
      });
      
      if (transactions.length > 0) {
        const summary = calculateFloorsheetSummary(transactions);
        
        return {
          success: true,
          data: {
            symbol,
            companyName,
            floorsheetDate: new Date().toISOString().split('T')[0],
            totalRecords: transactions.length,
            floorsheet: transactions,
            summary,
            source: 'ShareSansar'
          },
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // If company-specific page didn't work, try filtering from the main floorsheet
    console.log('No transactions found, trying general floorsheet with filtering...');
    
    const generalResponse = await axios.get('https://www.sharesansar.com/floorsheet', requestOptions);
    const generalHtml = generalResponse.data;
    const $general = cheerio.load(generalHtml);
    
    const generalTable = $general('.table-bordered');
    if (generalTable.length) {
      const transactions = [];
      
      generalTable.find('tbody tr').each((index, row) => {
        try {
          const cells = $general(row).find('td');
          
          // Skip rows without enough cells
          if (cells.length < 8) return;
          
          // General page has symbol at index 2
          const stockSymbol = $general(cells[2]).text().trim();
          
          // Only include rows for the requested symbol
          if (stockSymbol && stockSymbol.toUpperCase() === symbol) {
            const sn = parseInt($general(cells[0]).text().trim()) || index + 1;
            const contractNo = $general(cells[1]).text().trim();
            const buyer = parseInt($general(cells[3]).text().trim()) || 0;
            const seller = parseInt($general(cells[4]).text().trim()) || 0;
            const quantity = parseNumberValue($general(cells[5]).text().trim());
            const rate = parseNumberValue($general(cells[6]).text().trim());
            const amount = parseNumberValue($general(cells[7]).text().trim()) || (quantity * rate);
            
            // Validate the data before adding
            if (quantity > 0 && rate > 0) {
              transactions.push({
                sn,
                contract_no: contractNo,
                stockholder: symbol,
                buyer,
                seller,
                quantity,
                rate,
                amount
              });
            }
          }
        } catch (err) {
          console.error(`Error parsing ShareSansar general row ${index}:`, err.message);
        }
      });
      
      if (transactions.length > 0) {
        const summary = calculateFloorsheetSummary(transactions);
        
        return {
          success: true,
          data: {
            symbol,
            companyName,
            floorsheetDate: new Date().toISOString().split('T')[0],
            totalRecords: transactions.length,
            floorsheet: transactions,
            summary,
            source: 'ShareSansar Filtered'
          },
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Return empty response if no data found
    return createEmptyFloorsheetResponse(symbol, companyName);
    
  } catch (error) {
    console.error('Error in ShareSansar approach:', error.message);
    throw error;
  }
}

// Historical data source - implementing the missing function
async function fetchHistoricalFloorsheet(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching historical floorsheet data for ${symbol}...`);
    
    // Try to get data from the past week instead of just today
    // We'll construct dates for the past 7 days
    const dates = [];
    const today = new Date();
    
    // Generate dates for the past 7 days in YYYY-MM-DD format
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };
    
    // Try each date until we get results
    for (const date of dates) {
      try {
        console.log(`Trying historical data for date ${date} for ${symbol}...`);
        
        // Try MeroLagani historical date search
        const response = await axios.get(
          `https://merolagani.com/Floorsheet.aspx?symbol=${symbol}&date=${date}`, 
          requestOptions
        );
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        // Get company name if available
        const companyName = $('#ctl00_ContentPlaceHolder1_CompanyDetail1_companyName').text().trim() || 
                          $('.container h2').text().trim().replace('Floorsheet of ', '') || 
                          symbol;
        
        // Find the floorsheet table
        const floorsheetTable = $('table.table-bordered');
        
        if (floorsheetTable.length) {
          const transactions = [];
          
          floorsheetTable.find('tbody tr').each((index, row) => {
            try {
              const cells = $(row).find('td');
              
              // Skip rows without enough cells
              if (cells.length < 6) return;
              
              const sn = parseInt($(cells[0]).text().trim()) || index + 1;
              const contractNo = $(cells[1]).text().trim();
              
              // Detect if the 3rd column is stockholder
              const thirdCol = $(cells[2]).text().trim();
              const hasStockholder = thirdCol !== symbol && isNaN(parseInt(thirdCol));
              
              // Adjust indices based on whether stockholder column exists
              const buyerIdx = hasStockholder ? 3 : 2;
              const sellerIdx = hasStockholder ? 4 : 3;
              const qtyIdx = hasStockholder ? 5 : 4;
              const rateIdx = hasStockholder ? 6 : 5;
              
              const buyer = parseInt($(cells[buyerIdx]).text().trim()) || 0;
              const seller = parseInt($(cells[sellerIdx]).text().trim()) || 0;
              const quantity = parseNumberValue($(cells[qtyIdx]).text().trim());
              const rate = parseNumberValue($(cells[rateIdx]).text().trim());
              const amount = quantity * rate;
              
              // Only include transactions for this symbol
              transactions.push({
                sn,
                contract_no: contractNo,
                stockholder: symbol,
                buyer,
                seller,
                quantity,
                rate,
                amount,
                date
              });
            } catch (err) {
              console.error(`Error parsing historical row ${index}:`, err.message);
            }
          });
          
          if (transactions.length > 0) {
            const summary = calculateFloorsheetSummary(transactions);
            
            return {
              success: true,
              data: {
                symbol,
                companyName,
                floorsheetDate: date,
                totalRecords: transactions.length,
                floorsheet: transactions,
                summary,
                source: `Historical (${date})`,
                note: "This data is from a previous trading day as no data was found for today."
              },
              timestamp: new Date().toISOString()
            };
          }
        }
      } catch (err) {
        console.error(`Error fetching historical data for ${date}:`, err.message);
      }
    }
    
    // If no historical data found for any date, return empty response
    return createEmptyFloorsheetResponse(
      symbol, 
      symbol, 
      "No floorsheet data found for this stock in the past 7 days."
    );
    
  } catch (error) {
    console.error('Error in Historical approach:', error.message);
    throw error;
  }
}

// Helper function to calculate summary statistics
function calculateFloorsheetSummary(transactions) {
  const summary = {
    totalTransactions: transactions.length,
    totalQuantity: 0,
    totalAmount: 0,
    minRate: Number.MAX_VALUE,
    maxRate: 0,
    averageRate: 0
  };
  
  transactions.forEach(item => {
    summary.totalQuantity += item.quantity || 0;
    summary.totalAmount += item.amount || 0;
    
    if (item.rate > 0) {
      summary.minRate = Math.min(summary.minRate, item.rate);
      summary.maxRate = Math.max(summary.maxRate, item.rate);
    }
  });
  
  summary.minRate = summary.minRate === Number.MAX_VALUE ? 0 : summary.minRate;
  summary.averageRate = summary.totalQuantity > 0 ? 
    (summary.totalAmount / summary.totalQuantity) : 0;
  
  return summary;
}

// Helper to create an empty floorsheet response
function createEmptyFloorsheetResponse(symbol, companyName, message) {
  return {
    success: true,
    data: {
      symbol,
      companyName: companyName || symbol,
      floorsheetDate: new Date().toISOString().split('T')[0],
      totalRecords: 0,
      floorsheet: [],
      summary: {
        totalTransactions: 0,
        totalQuantity: 0,
        totalAmount: 0,
        minRate: 0,
        maxRate: 0,
        averageRate: 0
      },
      message: message || "No floorsheet transactions found for today. This may be due to no trading activity for this symbol today.",
      source: 'Empty Response'
    },
    timestamp: new Date().toISOString()
  };
}

// Helper function to parse number values (already defined in your code)
function parseNumberValue(text) {
  if (!text) return 0;
  // Remove commas and convert to float
  return parseFloat(text.replace(/,/g, '')) || 0;
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
  parseIndicesHTMLFromNepaliPaisa,
  scrapeFloorsheetData // Updated function
};