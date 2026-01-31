// Mock Data for Asset Management System

// Transaction data model
const mockTransactions = [
  {
    id: "txn-001",
    timestamp: "2026-01-29T10:54:31",
    cardHolder: "Alex Gitta",
    cardId: "NV-CON-LAP-9876",
    assetTag: "NV-CON-MAK-9468",
    type: "OUT",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-002",
    timestamp: "2026-01-29T10:52:15",
    cardHolder: "Sarah Nakato",
    cardId: "NV-CON-LAP-8765",
    assetTag: "NV-CON-MAK-8421",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-003",
    timestamp: "2026-01-29T10:48:22",
    cardHolder: "John Okello",
    cardId: "NV-CON-LAP-7654",
    assetTag: "NV-CON-MAK-7392",
    type: "OUT",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-004",
    timestamp: "2026-01-29T10:45:10",
    cardHolder: "Mary Nambi",
    cardId: "NV-CON-LAP-6543",
    assetTag: "NV-CON-MAK-6284",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-005",
    timestamp: "2026-01-29T10:42:33",
    cardHolder: "David Musoke",
    cardId: "NV-CON-LAP-5432",
    assetTag: "NV-CON-MAK-5176",
    type: "OUT",
    status: "unauthorized",
    isAuthorized: false
  },
  {
    id: "txn-006",
    timestamp: "2026-01-29T10:38:45",
    cardHolder: "Grace Auma",
    cardId: "NV-CON-LAP-4321",
    assetTag: "NV-CON-MAK-4068",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-007",
    timestamp: "2026-01-29T10:35:18",
    cardHolder: "Peter Ssemakula",
    cardId: "NV-CON-LAP-3210",
    assetTag: "NV-CON-MAK-3950",
    type: "OUT",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-008",
    timestamp: "2026-01-29T10:30:52",
    cardHolder: "Rebecca Nalwanga",
    cardId: "NV-CON-LAP-2109",
    assetTag: "NV-CON-MAK-2842",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-009",
    timestamp: "2026-01-29T10:25:40",
    cardHolder: "James Kato",
    cardId: "NV-CON-LAP-1098",
    assetTag: "NV-CON-MAK-1734",
    type: "OUT",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-010",
    timestamp: "2026-01-29T10:20:15",
    cardHolder: "Christine Nabirye",
    cardId: "NV-CON-LAP-0987",
    assetTag: "NV-CON-MAK-0626",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-011",
    timestamp: "2026-01-29T10:15:30",
    cardHolder: "Robert Mugisha",
    cardId: "NV-CON-LAP-9871",
    assetTag: "NV-CON-MAK-9518",
    type: "OUT",
    status: "authorized",
    isAuthorized: true
  },
  {
    id: "txn-012",
    timestamp: "2026-01-29T10:10:05",
    cardHolder: "Agnes Nakabugo",
    cardId: "NV-CON-LAP-8762",
    assetTag: "NV-CON-MAK-8410",
    type: "IN",
    status: "authorized",
    isAuthorized: true
  }
];

// Initial statistics data
const mockStatistics = {
  authorizedToday: 11,
  unauthorized: 1,
  totalScans: 12,
  lastUpdated: "2026-01-29T10:54:31"
};

// Application state
const appState = {
  currentMode: "check-in",
  currentFilter: "all",
  searchQuery: "",
  transactions: [...mockTransactions],
  statistics: { ...mockStatistics },
  guardName: "Alex Gitta",
  currentDate: "29 Jan 2026"
};

/**
 * Calculate statistics from transaction data
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Statistics object with authorized, unauthorized, and total counts
 */
function calculateStatistics(transactions) {
  const authorized = transactions.filter(t => t.isAuthorized === true).length;
  const unauthorized = transactions.filter(t => t.isAuthorized === false).length;
  const totalScans = transactions.length;
  
  return {
    authorizedToday: authorized,
    unauthorized: unauthorized,
    totalScans: totalScans,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Update application state statistics based on current transactions
 */
function updateStateStatistics() {
  appState.statistics = calculateStatistics(appState.transactions);
}

/**
 * Reload transaction data
 * In a real system, this would fetch fresh data from the server
 * For now, it resets to the original mock data
 */
function reloadTransactionData() {
  // Reset transactions to original mock data
  // In a real system, this would be an API call to fetch latest data
  appState.transactions = [...mockTransactions];
  appState.statistics.lastUpdated = new Date().toISOString();
}

/**
 * Get all unauthorized transactions from the transaction list
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Filtered array of unauthorized transactions
 */
function getUnauthorizedTransactions(transactions) {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }
  
  return transactions.filter(t => t && t.isAuthorized === false);
}

/**
 * Get the most recent unauthorized transaction
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object|null} Most recent unauthorized transaction or null
 */
function getLatestUnauthorizedTransaction(transactions) {
  const unauthorized = getUnauthorizedTransactions(transactions);
  
  if (unauthorized.length === 0) {
    return null;
  }
  
  // Sort by timestamp descending and return the first
  const sorted = [...unauthorized].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  return sorted[0];
}

/**
 * Calculate watchlist state from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Watchlist state object with unauthorizedTransactions, latestUnauthorized, hasIncidents, and incidentCount
 */
function calculateWatchlistState(transactions) {
  const unauthorizedTransactions = getUnauthorizedTransactions(transactions);
  const latestUnauthorized = getLatestUnauthorizedTransaction(transactions);
  
  return {
    unauthorizedTransactions: unauthorizedTransactions,
    latestUnauthorized: latestUnauthorized,
    hasIncidents: unauthorizedTransactions.length > 0,
    incidentCount: unauthorizedTransactions.length
  };
}

// Export data for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mockTransactions,
    mockStatistics,
    appState,
    calculateStatistics,
    updateStateStatistics,
    reloadTransactionData,
    getUnauthorizedTransactions,
    getLatestUnauthorizedTransaction,
    calculateWatchlistState
  };
}
