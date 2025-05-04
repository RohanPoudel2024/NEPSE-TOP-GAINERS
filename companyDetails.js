const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape company details from various sources
async function scrapeCompanyDetails(symbol) {
  try {
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }
    
    symbol = symbol.toUpperCase();
    console.log(`Attempting to scrape company details for ${symbol}...`);
    
    // Try sources in sequence until we get data
    const sources = [
      { name: 'MeroLagani', fn: fetchMeroLaganiCompanyDetails },
      { name: 'ShareSansar', fn: fetchShareSansarCompanyDetails },
      { name: 'NepaliPaisa', fn: fetchNepaliPaisaCompanyDetails }
    ];
    
    let lastError = null;
    
    // Try each source until one succeeds
    for (const source of sources) {
      try {
        console.log(`Trying ${source.name} source for ${symbol}...`);
        const result = await source.fn(symbol);
        
        // If we got valid company data, return it
        if (result && result.success && result.data) {
          console.log(`Successfully got company details from ${source.name}`);
          return result;
        }
        
        console.log(`${source.name} returned no data, trying next source...`);
      } catch (error) {
        console.error(`Error from ${source.name}:`, error.message);
        lastError = error;
      }
    }
    
    // If all sources failed, return an error response
    return {
      success: false,
      error: lastError ? lastError.message : 'Could not retrieve company details from any source',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`General error in company details scraping for ${symbol}:`, error.message);
    return {
      success: false,
      error: `Failed to fetch company details: ${error.message}`,
      timestamp: new Date().toISOString()
    };
  }
}

// MeroLagani source - enhanced to capture all company metrics
async function fetchMeroLaganiCompanyDetails(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching company details from MeroLagani for ${symbol}...`);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000
    };
    
    // Get company details page
    const response = await axios.get(`https://merolagani.com/CompanyDetail.aspx?symbol=${symbol}`, requestOptions);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract company information
    const companyName = $('#ctl00_ContentPlaceHolder1_CompanyDetail1_companyName').text().trim();
    
    // Extract metrics from the main accordion table
    const mainMetrics = {};
    $('#accordion tbody.panel').each((i, tbody) => {
      const row = $(tbody).find('tr').first();
      if (row.length) {
        const label = $(row).find('th').text().trim();
        const valueCell = $(row).find('td');
        const value = valueCell.text().trim();
        
        // Clean up label
        const cleanLabel = label.replace(/\s+/g, ' ').trim();
        
        // Store the value
        if (cleanLabel && value) {
          // Extract any additional info in parentheses
          let additionalInfo = '';
          const spanText = valueCell.find('span.text-primary').text().trim();
          if (spanText) {
            additionalInfo = spanText;
          }
          
          // Create an object for this metric
          mainMetrics[cleanKey(cleanLabel)] = {
            value: cleanValue(value.replace(spanText, '').trim()),
            raw: value,
            additionalInfo: additionalInfo || undefined
          };
        }
      }
    });
    
    // Extract dividend history
    const dividendHistory = extractTableData($, '#dividend-panel table tbody tr');
    
    // Extract bonus history
    const bonusHistory = extractTableData($, '#bonus-panel table tbody tr');
    
    // Extract right share history
    const rightShareHistory = extractTableData($, '#right-panel table tbody tr');
    
    // Create a structured object with all the company data
    const companyData = {
      symbol,
      companyName: companyName || symbol,
      sector: mainMetrics.sector?.value || 'Unknown',
      marketData: {
        ltp: parseNumberValue(mainMetrics.market_price?.value),
        change: parsePercentChange(mainMetrics.change?.value),
        lastTradedOn: mainMetrics.last_traded_on?.value,
        high52w: mainMetrics['52_weeks_high_low']?.value?.split('-')?.[0]?.trim(),
        low52w: mainMetrics['52_weeks_high_low']?.value?.split('-')?.[1]?.trim(),
        yearYield: parsePercentChange(mainMetrics['1_year_yield']?.value),
        avgVolume30d: parseNumberValue(mainMetrics['30_day_avg_volume']?.value)
      },
      keyMetrics: {
        sharesOutstanding: parseNumberValue(mainMetrics.shares_outstanding?.value),
        marketCap: parseNumberValue(mainMetrics.market_capitalization?.value),
        eps: {
          value: parseNumberValue(mainMetrics.eps?.value),
          fiscalYear: mainMetrics.eps?.additionalInfo
        },
        pe: parseNumberValue(mainMetrics.p_e_ratio?.value),
        bookValue: parseNumberValue(mainMetrics.book_value?.value),
        pbv: parseNumberValue(mainMetrics.pbv?.value),
        avg120Day: parseNumberValue(mainMetrics['120_day_average']?.value),
        avg180Day: mainMetrics['180_day_average']?.value ? parseNumberValue(mainMetrics['180_day_average']?.value) : undefined
      },
      dividendInfo: {
        cash: {
          latest: mainMetrics.dividend?.value ? parsePercentChange(mainMetrics.dividend?.value) : 0,
          fiscalYear: mainMetrics.dividend?.additionalInfo,
          history: dividendHistory
        },
        bonus: {
          latest: mainMetrics.bonus?.value ? parsePercentChange(mainMetrics.bonus?.value) : 0,
          fiscalYear: mainMetrics.bonus?.additionalInfo,
          history: bonusHistory
        },
        rightShare: {
          latest: mainMetrics.right_share?.value ? parsePercentChange(mainMetrics.right_share?.value) : 0,
          fiscalYear: mainMetrics.right_share?.additionalInfo,
          history: rightShareHistory
        }
      },
      source: 'MeroLagani'
    };
    
    // Extract financial highlights if available
    const financialHighlights = extractFinancialHighlights($);
    if (Object.keys(financialHighlights).length > 0) {
      companyData.financialHighlights = financialHighlights;
    }
    
    return {
      success: true,
      data: companyData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in MeroLagani company details fetch:', error.message);
    throw error;
  }
}

// ShareSansar source
async function fetchShareSansarCompanyDetails(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching company details from ShareSansar for ${symbol}...`);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    };
    
    // Get company page
    const response = await axios.get(`https://www.sharesansar.com/company/${symbol.toLowerCase()}`, requestOptions);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract company information
    const companyName = $('.company-profile h1').text().trim() || $('.panel-title').text().trim();
    const sector = $('.company-category a').first().text().trim() || 'Unknown';
    
    // Extract price information
    const priceBox = $('.quote-box');
    const ltp = parseNumberValue(priceBox.find('.current-price').text().trim());
    const change = parseNumberValue(priceBox.find('.number-rate').first().text().trim());
    const percentChangeText = priceBox.find('.percent-rate').text().trim();
    const percentChange = parseNumberValue(percentChangeText.replace(/[()%]/g, ''));
    
    // Extract company details
    const details = {};
    $('.company-table tr').each((index, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().replace(':', '');
        const value = $(cells[1]).text().trim();
        if (label && value) {
          details[cleanKey(label)] = value;
        }
      }
    });
    
    // Create company data object
    const companyData = {
      symbol,
      companyName: companyName || symbol,
      sector,
      marketData: {
        ltp,
        change,
        percentChange
      },
      companyDetails: details,
      source: 'ShareSansar'
    };
    
    return {
      success: true,
      data: companyData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in ShareSansar company details fetch:', error.message);
    throw error;
  }
}

// NepaliPaisa source
async function fetchNepaliPaisaCompanyDetails(symbol) {
  try {
    symbol = symbol.toUpperCase();
    console.log(`Fetching company details from NepaliPaisa for ${symbol}...`);
    
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    };
    
    // Get company page
    const response = await axios.get(`https://nepalipaisa.com/company/${symbol.toLowerCase()}`, requestOptions);
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Extract basic company information
    const companyName = $('.company-title h1').text().trim() || $('.company-name').text().trim();
    const sector = $('.company-sector').text().trim() || 'Unknown';
    
    // Extract price information
    const ltp = parseNumberValue($('.current-price').text().trim());
    const changeText = $('.price-change').text().trim();
    const change = parseNumberValue(changeText.split('(')[0]);
    const percentChangeText = changeText.match(/\(([^)]+)\)/);
    const percentChange = percentChangeText ? parseNumberValue(percentChangeText[1].replace('%', '')) : 0;
    
    // Extract company details
    const details = {};
    $('.company-info-table tr').each((index, row) => {
      const cells = $(row).find('td');
      if (cells.length >= 2) {
        const label = $(cells[0]).text().trim().replace(':', '');
        const value = $(cells[1]).text().trim();
        if (label && value) {
          details[cleanKey(label)] = value;
        }
      }
    });
    
    // Create company data object
    const companyData = {
      symbol,
      companyName: companyName || symbol,
      sector,
      marketData: {
        ltp,
        change,
        percentChange
      },
      companyDetails: details,
      source: 'NepaliPaisa'
    };
    
    return {
      success: true,
      data: companyData,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in NepaliPaisa company details fetch:', error.message);
    throw error;
  }
}

// Helper function to extract financial highlights
function extractFinancialHighlights($) {
  const highlights = {};
  
  // Try to find the financial highlights section
  const financialTable = $('#accordion-2');
  
  financialTable.find('tr').each((index, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      const label = $(cells[0]).text().trim().replace(':', '');
      const value = $(cells[1]).text().trim();
      if (label && value) {
        highlights[cleanKey(label)] = value;
      }
    }
  });
  
  return highlights;
}

// Helper function to extract table data
function extractTableData($, selector) {
  const rows = [];
  let headers = [];
  
  $(selector).each((i, row) => {
    const cells = $(row).find('td, th');
    
    // If this is a header row, extract the column names
    if ($(row).find('th').length > 0) {
      headers = [];
      cells.each((j, cell) => {
        headers.push($(cell).text().trim());
      });
    } else if (cells.length > 0) {
      // For data rows
      const rowData = {};
      cells.each((j, cell) => {
        if (j < headers.length) {
          // Use the header as property name if available
          const headerText = headers[j] || `column_${j}`;
          rowData[cleanKey(headerText)] = $(cell).text().trim();
        }
      });
      
      // Only add rows with actual data
      if (Object.keys(rowData).length > 0) {
        rows.push(rowData);
      }
    }
  });
  
  return rows;
}

// Helper function to clean up key names
function cleanKey(key) {
  return key
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

// Helper function to clean up values
function cleanValue(value) {
  if (!value) return '';
  
  // Remove any extra whitespace
  return value.replace(/\s+/g, ' ').trim();
}

// Helper function to parse number values
function parseNumberValue(text) {
  if (!text) return 0;
  // Remove commas, parentheses, and convert to float
  return parseFloat(text.replace(/[,()]/g, '')) || 0;
}

// Helper function to parse percentage changes
function parsePercentChange(text) {
  if (!text) return 0;
  
  // Extract the numeric part from text like "0.06 %" or "5.09%"
  const matches = text.match(/([-+]?\d+\.?\d*)[ ]?%?/);
  if (matches && matches[1]) {
    return parseFloat(matches[1]);
  }
  return 0;
}

// Export functions
module.exports = {
  scrapeCompanyDetails,
  fetchMeroLaganiCompanyDetails,
  fetchShareSansarCompanyDetails,
  fetchNepaliPaisaCompanyDetails
};