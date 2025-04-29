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

// Export functions for use in server.js
module.exports = {
  scrapeGainers,
  parseGainersHTML
};

// If running this file directly, still allow testing
if (require.main === module) {
  // Example for testing when running app.js directly
  const htmlSnippet = `<!-- your HTML snippet here -->`;
  
  // Parse the HTML snippet
  const parsedData = parseGainersHTML(htmlSnippet);
  console.log("Parsed gainers data:");
  console.log(JSON.stringify(parsedData, null, 2));
  
  // Uncomment to test live scraping
  /*
  scrapeGainers().then(gainers => {
    console.log("Live scraped gainers data:");
    console.log(JSON.stringify(gainers, null, 2));
  });
  */
}