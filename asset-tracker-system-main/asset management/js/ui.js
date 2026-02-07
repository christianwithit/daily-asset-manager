// UI Update Functions for Asset Management System

/**
 * Formats a timestamp to HH:MM:SS display format
 * @param {string} timestamp - ISO 8601 timestamp string
 * @returns {string} Formatted time string (HH:MM:SS)
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Creates a status badge element (IN/OUT)
 * @param {string} type - Transaction type ('IN' or 'OUT')
 * @returns {string} HTML string for status badge
 */
function createStatusBadge(type) {
  const badgeClass = type.toLowerCase();
  return `<span class="status-badge ${badgeClass}">${type}</span>`;
}

/**
 * Creates a status icon element (checkmark or X)
 * @param {boolean} isAuthorized - Authorization status
 * @returns {string} HTML string for status icon
 */
function createStatusIcon(isAuthorized) {
  if (isAuthorized) {
    return '<span class="status-icon authorized">✓</span>';
  } else {
    return '<span class="status-icon unauthorized">✕</span>';
  }
}

/**
 * Creates a clickable asset tag link
 * @param {string} assetTag - Asset tag identifier
 * @returns {string} HTML string for asset tag link
 */
function createAssetTagLink(assetTag) {
  return `<a href="#" class="asset-tag-link" data-asset="${assetTag}">${assetTag}</a>`;
}

/**
 * Renders transaction data into table rows
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filter - Filter type ('all', 'authorized', 'unauthorized', 'in', 'out')
 */
function renderTable(transactions, filter = 'all') {
  const tableBody = document.getElementById('tableBody');
  
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }
  
  // Filter transactions based on filter type
  let filteredTransactions = filterTransactions(transactions, filter);
  
  // Sort transactions by time in descending order (most recent first)
  filteredTransactions.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Performance optimization: Limit displayed rows for large datasets
  const MAX_VISIBLE_ROWS = 100;
  const displayTransactions = filteredTransactions.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filteredTransactions.length > MAX_VISIBLE_ROWS;
  
  // Clear existing table rows
  tableBody.innerHTML = '';
  
  // Check if there are no transactions
  if (filteredTransactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-medium-gray);">
          No transactions found
        </td>
      </tr>
    `;
    return;
  }
  
  // Performance optimization: Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();
  
  // Create table rows for each transaction
  displayTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'row');
    
    row.innerHTML = `
      <td>${formatTime(transaction.timestamp)}</td>
      <td>${transaction.cardHolder}</td>
      <td>${transaction.cardId}</td>
      <td>${createAssetTagLink(transaction.assetTag)}</td>
      <td>${createStatusBadge(transaction.type)}</td>
      <td>${createStatusIcon(transaction.isAuthorized)}</td>
    `;
    
    fragment.appendChild(row);
  });
  
  // Add info row if there are more rows than displayed
  if (hasMoreRows) {
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 20px; color: var(--color-medium-gray); background-color: var(--color-light-gray); font-style: italic;">
        Showing ${displayTransactions.length} of ${filteredTransactions.length} transactions. Use filters or export to view all data.
      </td>
    `;
    fragment.appendChild(infoRow);
  }
  
  // Append all rows at once for better performance
  tableBody.appendChild(fragment);
  
  // Add click event listeners to asset tag links
  attachAssetTagListeners();
}

/**
 * Renders transaction data into table rows with search highlighting
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filter - Filter type ('all', 'authorized', 'unauthorized', 'in', 'out')
 * @param {string} searchQuery - Search query to highlight
 */
function renderTableWithSearch(transactions, filter = 'all', searchQuery = '') {
  const tableBody = document.getElementById('tableBody');
  
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }
  
  // Filter transactions based on filter type
  let filteredTransactions = filterTransactions(transactions, filter);
  
  // Sort transactions by time in descending order (most recent first)
  filteredTransactions.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Performance optimization: Limit displayed rows for large datasets
  const MAX_VISIBLE_ROWS = 100;
  const displayTransactions = filteredTransactions.slice(0, MAX_VISIBLE_ROWS);
  const hasMoreRows = filteredTransactions.length > MAX_VISIBLE_ROWS;
  
  // Clear existing table rows
  tableBody.innerHTML = '';
  
  // Check if there are no transactions
  if (filteredTransactions.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-medium-gray);">
          No matching transactions found
        </td>
      </tr>
    `;
    return;
  }
  
  // Performance optimization: Use DocumentFragment for batch DOM updates
  const fragment = document.createDocumentFragment();
  
  // Create table rows for each transaction with highlighting
  displayTransactions.forEach(transaction => {
    const row = document.createElement('tr');
    row.classList.add('search-result');
    row.setAttribute('tabindex', '0');
    row.setAttribute('role', 'row');
    
    // Highlight matching text in card holder and asset tag
    const highlightedCardHolder = highlightText(transaction.cardHolder, searchQuery);
    const highlightedAssetTag = highlightText(transaction.assetTag, searchQuery);
    
    row.innerHTML = `
      <td>${formatTime(transaction.timestamp)}</td>
      <td>${highlightedCardHolder}</td>
      <td>${transaction.cardId}</td>
      <td><a href="#" class="asset-tag-link" data-asset="${transaction.assetTag}">${highlightedAssetTag}</a></td>
      <td>${createStatusBadge(transaction.type)}</td>
      <td>${createStatusIcon(transaction.isAuthorized)}</td>
    `;
    
    fragment.appendChild(row);
  });
  
  // Add info row if there are more rows than displayed
  if (hasMoreRows) {
    const infoRow = document.createElement('tr');
    infoRow.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 20px; color: var(--color-medium-gray); background-color: var(--color-light-gray); font-style: italic;">
        Showing ${displayTransactions.length} of ${filteredTransactions.length} matching transactions. Use filters or export to view all data.
      </td>
    `;
    fragment.appendChild(infoRow);
  }
  
  // Append all rows at once for better performance
  tableBody.appendChild(fragment);
  
  // Add click event listeners to asset tag links
  attachAssetTagListeners();
}

/**
 * Highlights matching text in a string
 * @param {string} text - Text to search in
 * @param {string} query - Search query to highlight
 * @returns {string} HTML string with highlighted text
 */
function highlightText(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Escapes special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filters transactions based on filter type
 * @param {Array} transactions - Array of transaction objects
 * @param {string} filter - Filter type
 * @returns {Array} Filtered transactions
 */
function filterTransactions(transactions, filter) {
  switch (filter) {
    case 'authorized':
      return transactions.filter(t => t.isAuthorized === true);
    case 'unauthorized':
      return transactions.filter(t => t.isAuthorized === false);
    case 'in':
      return transactions.filter(t => t.type === 'IN');
    case 'out':
      return transactions.filter(t => t.type === 'OUT');
    case 'all':
    default:
      return transactions;
  }
}

/**
 * Attaches click event listeners to asset tag links
 */
function attachAssetTagListeners() {
  const assetLinks = document.querySelectorAll('.asset-tag-link');
  
  assetLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const assetTag = e.target.getAttribute('data-asset');
      showAssetDetails(assetTag);
    });
  });
}

/**
 * Shows asset details in an alert dialog
 * @param {string} assetTag - Asset tag identifier
 */
function showAssetDetails(assetTag) {
  // Find all transactions for this asset
  const assetTransactions = appState.transactions.filter(t => t.assetTag === assetTag);
  
  if (assetTransactions.length === 0) {
    alert(`Asset Details\n\nAsset Tag: ${assetTag}\n\nNo transaction history found for this asset.`);
    return;
  }
  
  // Sort transactions by time (most recent first)
  assetTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Get the most recent transaction
  const latestTransaction = assetTransactions[0];
  
  // Count check-ins and check-outs
  const checkIns = assetTransactions.filter(t => t.type === 'IN').length;
  const checkOuts = assetTransactions.filter(t => t.type === 'OUT').length;
  
  // Count authorized and unauthorized
  const authorized = assetTransactions.filter(t => t.isAuthorized).length;
  const unauthorized = assetTransactions.filter(t => t.isAuthorized === false).length;
  
  // Get unique card holders who have used this asset
  const cardHolders = [...new Set(assetTransactions.map(t => t.cardHolder))];
  
  // Build the details message
  let message = `ASSET DETAILS\n`;
  message += `${'='.repeat(50)}\n\n`;
  message += `Asset Tag: ${assetTag}\n\n`;
  
  message += `CURRENT STATUS\n`;
  message += `${'-'.repeat(50)}\n`;
  message += `Last Activity: ${formatTime(latestTransaction.timestamp)}\n`;
  message += `Last Card Holder: ${latestTransaction.cardHolder}\n`;
  message += `Last Card ID: ${latestTransaction.cardId}\n`;
  message += `Current Status: ${latestTransaction.type}\n`;
  message += `Authorization: ${latestTransaction.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'}\n\n`;
  
  message += `TRANSACTION SUMMARY\n`;
  message += `${'-'.repeat(50)}\n`;
  message += `Total Transactions: ${assetTransactions.length}\n`;
  message += `Check-Ins: ${checkIns}\n`;
  message += `Check-Outs: ${checkOuts}\n`;
  message += `Authorized: ${authorized}\n`;
  message += `Unauthorized: ${unauthorized}\n\n`;
  
  message += `CARD HOLDERS\n`;
  message += `${'-'.repeat(50)}\n`;
  message += cardHolders.join(', ') + '\n\n';
  
  message += `RECENT ACTIVITY (Last 5)\n`;
  message += `${'-'.repeat(50)}\n`;
  const recentTransactions = assetTransactions.slice(0, 5);
  recentTransactions.forEach((t, index) => {
    message += `${index + 1}. ${formatTime(t.timestamp)} - ${t.cardHolder} - ${t.type} - ${t.isAuthorized ? 'AUTH' : 'UNAUTH'}\n`;
  });
  
  // Display the alert
  alert(message);
}

/**
 * Update statistics dashboard with current counts
 * @param {number} authorized - Count of authorized transactions
 * @param {number} unauthorized - Count of unauthorized transactions
 * @param {number} totalScans - Total count of all transactions
 */
function updateStatistics(authorized, unauthorized, totalScans) {
  // Update authorized count with animation
  const authorizedElement = document.getElementById('authorizedCount');
  if (authorizedElement) {
    const oldValue = parseInt(authorizedElement.textContent);
    authorizedElement.textContent = authorized;
    if (oldValue !== authorized) {
      authorizedElement.classList.add('updated');
      setTimeout(() => authorizedElement.classList.remove('updated'), 500);
    }
  }
  
  // Update unauthorized count with animation
  const unauthorizedElement = document.getElementById('unauthorizedCount');
  if (unauthorizedElement) {
    const oldValue = parseInt(unauthorizedElement.textContent);
    unauthorizedElement.textContent = unauthorized;
    if (oldValue !== unauthorized) {
      unauthorizedElement.classList.add('updated');
      setTimeout(() => unauthorizedElement.classList.remove('updated'), 500);
    }
  }
  
  // Update total scans count with animation
  const totalScansElement = document.getElementById('totalScansCount');
  if (totalScansElement) {
    const oldValue = parseInt(totalScansElement.textContent);
    totalScansElement.textContent = totalScans;
    if (oldValue !== totalScans) {
      totalScansElement.classList.add('updated');
      setTimeout(() => totalScansElement.classList.remove('updated'), 500);
    }
  }
}

/**
 * Update statistics from application state
 */
function updateStatisticsFromState() {
  const stats = appState.statistics;
  updateStatistics(stats.authorizedToday, stats.unauthorized, stats.totalScans);
}



/**
 * Converts table data to CSV format
 * @param {Array} transactions - Array of transaction objects to export
 * @returns {string} CSV formatted string
 */
function convertToCSV(transactions) {
  // Define CSV headers
  const headers = ['TIME', 'CARD HOLDER', 'CARD ID', 'ASSET TAG', 'TYPE', 'STATUS'];
  
  // Create CSV header row
  let csv = headers.join(',') + '\n';
  
  // Add data rows
  transactions.forEach(transaction => {
    const row = [
      formatTime(transaction.timestamp),
      `"${transaction.cardHolder}"`, // Wrap in quotes to handle commas in names
      transaction.cardId,
      transaction.assetTag,
      transaction.type,
      transaction.isAuthorized ? 'AUTHORIZED' : 'UNAUTHORIZED'
    ];
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

/**
 * Generates a filename with current date and timestamp
 * @returns {string} Filename in format asset_register_YYYY-MM-DD_HH-MM-SS.csv
 */
function generateExportFilename() {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `asset_register_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.csv`;
}

/**
 * Triggers a file download in the browser
 * @param {string} content - File content
 * @param {string} filename - Name of the file to download
 * @param {string} mimeType - MIME type of the file
 */
function downloadFile(content, filename, mimeType = 'text/csv') {
  // Create a Blob from the content
  const blob = new Blob([content], { type: mimeType });
  
  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);
  
  // Create a temporary anchor element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the object URL
  window.URL.revokeObjectURL(url);
}

/**
 * Exports the current table data to CSV format
 * Applies the current filter and downloads the file
 */
function exportTableData() {
  // Get filtered transactions based on current filter
  const filteredTransactions = filterTransactions(appState.transactions, appState.currentFilter);
  
  // Sort transactions by time in descending order (same as table display)
  filteredTransactions.sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Convert to CSV
  const csvContent = convertToCSV(filteredTransactions);
  
  // Generate filename
  const filename = generateExportFilename();
  
  // Trigger download
  downloadFile(csvContent, filename, 'text/csv');
}

/**
 * Formats the current date and time for footer display
 * Format: "Day, Month DD, YYYY at HH:MM:SS TZ"
 * Example: "Thursday, January 29, 2026 at 10:54:31 EAT"
 * @returns {string} Formatted date and time string
 */
function formatFooterDateTime() {
  const now = new Date();
  
  // Get day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  
  // Get month name
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[now.getMonth()];
  
  // Get day, year
  const day = now.getDate();
  const year = now.getFullYear();
  
  // Get time components
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  // Default to EAT for Vision Group Uganda
  const timezone = 'EAT';
  
  // Construct the formatted string
  return `${dayName}, ${monthName} ${day}, ${year} at ${hours}:${minutes}:${seconds} ${timezone}`;
}

/**
 * Updates the footer timestamp display
 */
function updateFooterTime() {
  const footerTimestamp = document.getElementById('footerTimestamp');
  
  if (footerTimestamp) {
    footerTimestamp.textContent = formatFooterDateTime();
  }
}

/**
 * Initializes the real-time clock in the footer
 * Updates the timestamp every second
 */
function initializeFooterClock() {
  // Update immediately on initialization
  updateFooterTime();
  
  // Update every second (1000 milliseconds)
  setInterval(updateFooterTime, 1000);
}

/**
 * Sets the guard name in the header
 * @param {string} guardName - Name of the guard to display
 */
function setGuardName(guardName) {
  const guardNameElement = document.getElementById('guardName');
  
  if (guardNameElement) {
    guardNameElement.textContent = guardName;
  }
}

/**
 * Formats the current date for header display
 * Format: "DD Mon YYYY"
 * Example: "29 Jan 2026"
 * @returns {string} Formatted date string
 */
function formatHeaderDate() {
  const now = new Date();
  
  // Get month abbreviation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthAbbr = months[now.getMonth()];
  
  // Get day and year
  const day = now.getDate();
  const year = now.getFullYear();
  
  // Construct the formatted string
  return `${day} ${monthAbbr} ${year}`;
}

/**
 * Updates the header date display
 */
function updateHeaderDate() {
  const headerDateElement = document.getElementById('headerDate');
  
  if (headerDateElement) {
    headerDateElement.textContent = formatHeaderDate();
  }
}

/**
 * Initializes the header with guard name and current date
 * @param {string} guardName - Name of the guard (optional, uses default from appState if not provided)
 */
function initializeHeader(guardName) {
  // Get authenticated user data
  const userData = getAuthenticatedUser();
  
  // Use authenticated username or provided guard name or default from appState
  const name = userData.username || guardName || appState.guardName;
  
  // Set guard name
  setGuardName(name);
  
  // Update date display
  updateHeaderDate();
  
  // Set up logout button listener
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    });
  }
}

// ============================================================================
// WATCHLIST UI RENDERING FUNCTIONS
// ============================================================================

/**
 * Format relative time for incident timestamps
 * @param {string} timestamp - ISO 8601 timestamp string
 * @returns {string} Relative time string (e.g., "2 mins ago")
 */
function formatRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}

/**
 * Render the Active Alert Card with the latest unauthorized transaction
 * @param {Object} transaction - Unauthorized transaction object
 */
function renderActiveAlertCard(transaction) {
  const cardHolderElement = document.getElementById('alertCardHolder');
  const cardIdElement = document.getElementById('alertCardId');
  const timestampElement = document.getElementById('alertTimestamp');
  
  if (cardHolderElement) {
    cardHolderElement.textContent = transaction.cardHolder || '-';
  }
  
  if (cardIdElement) {
    cardIdElement.textContent = transaction.cardId || '-';
  }
  
  if (timestampElement) {
    timestampElement.textContent = formatTime(transaction.timestamp) || '-';
  }
}

/**
 * Create an incident item HTML element
 * @param {Object} transaction - Unauthorized transaction object
 * @returns {string} HTML string for incident item
 */
function createIncidentItem(transaction) {
  const description = `Unauthorized: ${transaction.assetTag}`;
  const relativeTime = formatRelativeTime(transaction.timestamp);
  const cardHolder = transaction.cardHolder || 'Unknown';
  
  return `
    <div class="incident-item" role="listitem" aria-label="Unauthorized access by ${cardHolder} for asset ${transaction.assetTag}, ${relativeTime}">
      <div class="incident-icon" role="img" aria-label="Warning">
        <i data-lucide="alert-circle" aria-hidden="true"></i>
      </div>
      <div class="incident-content">
        <div class="incident-description">${description}</div>
        <div class="incident-time">${relativeTime}</div>
      </div>
    </div>
  `;
}

/**
 * Render the Incident Feed with all unauthorized transactions
 * @param {Array} transactions - Array of unauthorized transaction objects
 */
function renderIncidentFeed(transactions) {
  const incidentList = document.getElementById('incidentList');
  
  if (!incidentList) {
    console.warn('Incident list element not found');
    return;
  }
  
  // Sort transactions by timestamp descending
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  // Clear existing incidents
  incidentList.innerHTML = '';
  
  // Create incident items using DocumentFragment for efficient DOM updates
  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement('div');
  
  sortedTransactions.forEach(transaction => {
    tempDiv.innerHTML = createIncidentItem(transaction);
    fragment.appendChild(tempDiv.firstElementChild);
  });
  
  incidentList.appendChild(fragment);
  
  // Reinitialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Update the Watchlist display based on current state
 * @param {Object} watchlistState - Watchlist state object
 */
function updateWatchlist(watchlistState) {
  const cleanState = document.getElementById('watchlistCleanState');
  const alertState = document.getElementById('watchlistAlertState');
  
  if (!cleanState || !alertState) {
    console.warn('Watchlist state elements not found');
    return;
  }
  
  if (watchlistState.hasIncidents) {
    // Show alert state
    cleanState.style.display = 'none';
    alertState.style.display = 'block';
    
    // Render active alert card
    if (watchlistState.latestUnauthorized) {
      renderActiveAlertCard(watchlistState.latestUnauthorized);
    }
    
    // Render incident feed
    renderIncidentFeed(watchlistState.unauthorizedTransactions);
  } else {
    // Show clean state
    cleanState.style.display = 'flex';
    alertState.style.display = 'none';
  }
}

/**
 * Update Watchlist from application state
 */
function updateWatchlistFromState() {
  const watchlistState = calculateWatchlistState(appState.transactions);
  updateWatchlist(watchlistState);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTime,
    createStatusBadge,
    createStatusIcon,
    createAssetTagLink,
    renderTable,
    renderTableWithSearch,
    filterTransactions,
    attachAssetTagListeners,
    showAssetDetails,
    updateStatistics,
    updateStatisticsFromState,
    convertToCSV,
    generateExportFilename,
    downloadFile,
    exportTableData,
    formatFooterDateTime,
    updateFooterTime,
    initializeFooterClock,
    setGuardName,
    formatHeaderDate,
    updateHeaderDate,
    initializeHeader,
    formatRelativeTime,
    renderActiveAlertCard,
    createIncidentItem,
    renderIncidentFeed,
    updateWatchlist,
    updateWatchlistFromState
  };
}
