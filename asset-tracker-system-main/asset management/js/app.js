// Main Application Controller for Asset Management System

/**
 * Debounce utility function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Check authentication status
 * Redirects to login page if user is not authenticated
 */
function checkAuthentication() {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');
  
  if (!isAuthenticated || isAuthenticated !== 'true') {
    // Redirect to login page
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

/**
 * Get authenticated user data
 * @returns {Object} User data from session storage
 */
function getAuthenticatedUser() {
  return {
    username: sessionStorage.getItem('username') || 'Unknown',
    entrance: sessionStorage.getItem('entrance') || 'Unknown',
    loginTime: sessionStorage.getItem('loginTime') || new Date().toISOString()
  };
}

/**
 * Handle logout
 */
function handleLogout() {
  // Clear session storage
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = 'login.html';
}

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  // Check authentication first
  if (!checkAuthentication()) {
    return; // Stop initialization if not authenticated
  }
  
  // Initialize header with guard name and date
  initializeHeader();

  // Initialize the entry/exit toggle
  initializeEntryExitToggle();

  // Calculate and update statistics from current transaction data
  updateStateStatistics();

  // Initialize the statistics dashboard
  updateStatisticsFromState();

  // Initialize the table with mock data
  initializeTable();

  // Initialize the real-time footer clock
  initializeFooterClock();

  // Set up event listeners
  setupEventListeners();

  // Initialize Watchlist event listeners
  initializeWatchlistListeners();

  // Initialize auto-refresh mechanism
  initializeAutoRefresh();
});

/**
 * Initialize the entry/exit toggle to the correct default state
 */
function initializeEntryExitToggle() {
  const entryExitToggle = document.getElementById('entryExitToggle');
  const toggleText = document.getElementById('toggleText');

  if (entryExitToggle && toggleText) {
    // Set default state to ENTRY (check-in mode)
    entryExitToggle.checked = true;
    toggleText.textContent = 'ENTRY';
    appState.currentMode = 'check-in';

    // Set initial theme to green (entry mode)
    document.body.classList.add('entry-mode');
    document.body.classList.remove('exit-mode');

    // Update process button text
    updateProcessButtonText('check-in');
  }
}

/**
 * Initialize the table with transaction data
 */
function initializeTable() {
  // Render the table with all transactions
  renderTable(appState.transactions, appState.currentFilter);

  // Update Watchlist with current data
  updateWatchlistFromState();
}

/**
 * Handle search input for trace asset field
 * Searches transactions by asset tag or card holder name
 * @param {Event} event - Input event
 */
function handleSearchInput(event) {
  const searchQuery = event.target.value.trim().toLowerCase();

  // If search query is empty, show all transactions with current filter
  if (!searchQuery) {
    appState.searchQuery = '';
    renderTable(appState.transactions, appState.currentFilter);
    return;
  }

  // Store search query in app state
  appState.searchQuery = searchQuery;

  // Search transactions by asset tag or card holder name
  const searchResults = searchTransactions(searchQuery);

  // Render table with search results and apply current filter
  renderTableWithSearch(searchResults, appState.currentFilter, searchQuery);
}

/**
 * Search transactions by asset tag or card holder name
 * @param {string} query - Search query string
 * @returns {Array} Filtered transactions matching the search query
 */
function searchTransactions(query) {
  const lowerQuery = query.toLowerCase();

  return appState.transactions.filter(transaction => {
    const assetTag = transaction.assetTag.toLowerCase();
    const cardHolder = transaction.cardHolder.toLowerCase();

    return assetTag.includes(lowerQuery) || cardHolder.includes(lowerQuery);
  });
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
  // Filter dropdown event listener
  const filterDropdown = document.getElementById('filterDropdown');
  if (filterDropdown) {
    filterDropdown.addEventListener('change', handleFilterChange);
  }

  // Entry/Exit toggle event listener
  const entryExitToggle = document.getElementById('entryExitToggle');
  if (entryExitToggle) {
    entryExitToggle.addEventListener('change', handleEntryExitToggle);
  }

  // Guests button event listener
  const guestsBtn = document.getElementById('guestsBtn');
  if (guestsBtn) {
    guestsBtn.addEventListener('click', handleGuestsNavigation);
  }

  // Process button event listener
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    processBtn.addEventListener('click', handleProcessTransaction);
  }

  // Refresh button event listener
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', handleRefresh);
  }

  // Export button event listener
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExport);
  }

  // Flag button event listener
  const flagBtn = document.getElementById('flagBtn');
  if (flagBtn) {
    flagBtn.addEventListener('click', handleFlagAsset);
  }

  // Trace asset search input event listener with debouncing
  const traceAssetInput = document.getElementById('traceAsset');
  if (traceAssetInput) {
    traceAssetInput.addEventListener('input', debounce(handleSearchInput, 300));
  }

  // Real-time validation for card ID field
  const cardIdInput = document.getElementById('cardId');
  if (cardIdInput) {
    cardIdInput.addEventListener('input', handleCardIdValidation);
    cardIdInput.addEventListener('blur', handleCardIdValidation);
  }

  // Real-time validation for device tag field
  const deviceTagInput = document.getElementById('deviceTag');
  if (deviceTagInput) {
    deviceTagInput.addEventListener('input', handleDeviceTagValidation);
    deviceTagInput.addEventListener('blur', handleDeviceTagValidation);
  }

  // Keyboard navigation support
  setupKeyboardNavigation();
}

/**
 * Set up keyboard navigation for the application
 */
function setupKeyboardNavigation() {
  // Handle Enter key on form inputs to submit
  const transactionForm = document.getElementById('transactionForm');
  if (transactionForm) {
    transactionForm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleProcessTransaction();
      }
    });
  }

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Alt+I for Entry mode (Check-In)
    if (e.altKey && e.key === 'i') {
      e.preventDefault();
      const entryExitToggle = document.getElementById('entryExitToggle');
      if (entryExitToggle) {
        entryExitToggle.checked = true;
        handleEntryExitToggle({ target: entryExitToggle });
        entryExitToggle.focus();
      }
    }

    // Alt+O for Exit mode (Check-Out)
    if (e.altKey && e.key === 'o') {
      e.preventDefault();
      const entryExitToggle = document.getElementById('entryExitToggle');
      if (entryExitToggle) {
        entryExitToggle.checked = false;
        handleEntryExitToggle({ target: entryExitToggle });
        entryExitToggle.focus();
      }
    }

    // Alt+R for Refresh
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      handleRefresh();
    }

    // Alt+E for Export
    if (e.altKey && e.key === 'e') {
      e.preventDefault();
      handleExport();
    }

    // Escape key to clear search
    if (e.key === 'Escape') {
      const traceAssetInput = document.getElementById('traceAsset');
      if (traceAssetInput && traceAssetInput.value) {
        traceAssetInput.value = '';
        appState.searchQuery = '';
        renderTable(appState.transactions, appState.currentFilter);
        traceAssetInput.blur();
      }
    }
  });

  // Improve table row keyboard navigation
  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;

    // If focused on a table row, allow arrow key navigation
    if (activeElement && activeElement.tagName === 'TR') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextRow = activeElement.nextElementSibling;
        if (nextRow) {
          nextRow.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevRow = activeElement.previousElementSibling;
        if (prevRow) {
          prevRow.focus();
        }
      }
    }
  });
}

/**
 * Handle filter dropdown change
 * @param {Event} event - Change event
 */
function handleFilterChange(event) {
  const filterValue = event.target.value;
  appState.currentFilter = filterValue;

  // If there's an active search query, apply both search and filter
  if (appState.searchQuery) {
    const searchResults = searchTransactions(appState.searchQuery);
    renderTableWithSearch(searchResults, filterValue, appState.searchQuery);
  } else {
    renderTable(appState.transactions, filterValue);
  }

  // Note: Statistics always show total counts, not filtered counts
  // This is intentional as per requirements - statistics show daily totals
}

/**
 * Handle guests button navigation
 */
function handleGuestsNavigation() {
  // Open guest management modal instead of navigating
  openGuestModal();
}

/**
 * Open the guest management modal
 */
function openGuestModal() {
  const modalOverlay = document.getElementById('guestModalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    // Initialize guest modal functionality
    initializeGuestModal();

    // Focus the first input
    const cardInput = document.getElementById('modalGuestCardNumber');
    if (cardInput) {
      setTimeout(() => cardInput.focus(), 100);
    }
  }
}

/**
 * Close the guest management modal
 */
function closeGuestModal() {
  const modalOverlay = document.getElementById('guestModalOverlay');
  if (modalOverlay) {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = ''; // Restore background scrolling

    // Reset modal state
    resetGuestModal();
  }
}

/**
 * Initialize guest modal functionality
 */
function initializeGuestModal() {
  // Initialize modal state
  if (!window.modalGuestState) {
    window.modalGuestState = {
      currentAction: 'check-in',
      guestCard: '',
      devices: [],
      deviceCounter: 0,
      isProcessing: false,
      scannerTimeout: null,
      fastInputThreshold: 100,
      lastInputTime: 0
    };
  }

  // Set up modal event listeners
  setupModalEventListeners();

  // Initialize scanner detection for modal
  initializeModalScannerDetection();

  // Set default action state
  updateModalActionState('check-in');
}

/**
 * Set up event listeners for modal elements
 */
function setupModalEventListeners() {
  // Close button
  const closeBtn = document.getElementById('closeGuestModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeGuestModal);
  }

  // Close on overlay click
  const modalOverlay = document.getElementById('guestModalOverlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeGuestModal();
      }
    });
  }

  // Guest card input
  const cardInput = document.getElementById('modalGuestCardNumber');
  if (cardInput) {
    cardInput.addEventListener('input', handleModalCardInput);
    cardInput.addEventListener('keydown', handleModalCardKeydown);
  }

  // Device tag input
  const deviceInput = document.getElementById('modalDeviceTagInput');
  if (deviceInput) {
    deviceInput.addEventListener('input', handleModalDeviceInput);
    deviceInput.addEventListener('keydown', handleModalDeviceKeydown);
  }

  // Action buttons
  const checkInBtn = document.getElementById('modalCheckInBtn');
  const checkOutBtn = document.getElementById('modalCheckOutBtn');

  if (checkInBtn) {
    checkInBtn.addEventListener('click', () => handleModalActionToggle('check-in'));
  }

  if (checkOutBtn) {
    checkOutBtn.addEventListener('click', () => handleModalActionToggle('check-out'));
  }

  // Process button
  const processBtn = document.getElementById('modalProcessGuestBtn');
  if (processBtn) {
    processBtn.addEventListener('click', handleModalProcessGuest);
  }

  // Escape key to close modal
  document.addEventListener('keydown', handleModalKeydown);
}

/**
 * Handle modal keydown events
 */
function handleModalKeydown(event) {
  const modal = document.getElementById('guestModalOverlay');
  if (!modal || modal.style.display === 'none') return;

  // Escape key closes modal
  if (event.key === 'Escape') {
    event.preventDefault();
    closeGuestModal();
  }

  // Alt + I for Check-In
  if (event.altKey && event.key === 'i') {
    event.preventDefault();
    handleModalActionToggle('check-in');
  }

  // Alt + O for Check-Out
  if (event.altKey && event.key === 'o') {
    event.preventDefault();
    handleModalActionToggle('check-out');
  }

  // Alt + P for Process
  if (event.altKey && event.key === 'p') {
    event.preventDefault();
    handleModalProcessGuest();
  }
}

/**
 * Initialize scanner detection for modal inputs
 */
function initializeModalScannerDetection() {
  // Scanner detection is handled by the existing global listener
  // Just need to ensure modal inputs have the scanner-input class
}

/**
 * Handle modal card input
 */
function handleModalCardInput(event) {
  const cardNumber = event.target.value.trim();
  window.modalGuestState.guestCard = cardNumber;

  // Show/hide confirmation message
  const confirmation = document.getElementById('modalCardConfirmation');
  if (confirmation) {
    if (cardNumber.length >= 3) {
      confirmation.style.display = 'flex';
      confirmation.classList.add('fade-in');
    } else {
      confirmation.style.display = 'none';
    }
  }

  // Clear validation errors if card is entered
  if (cardNumber.length > 0) {
    clearModalValidationErrors();
  }
}

/**
 * Handle modal card keydown
 */
function handleModalCardKeydown(event) {
  // Handle scanner terminators (Enter, Tab)
  if ([13, 9].includes(event.keyCode)) {
    event.preventDefault();

    const cardNumber = event.target.value.trim();
    if (cardNumber.length >= 3) {
      // Focus device input
      const deviceInput = document.getElementById('modalDeviceTagInput');
      if (deviceInput) {
        deviceInput.focus();
      }
    }
  }
}

/**
 * Handle modal device input
 */
function handleModalDeviceInput(event) {
  const deviceTag = event.target.value.trim();

  // Auto-add device when scanner input is detected
  if (deviceTag.length >= 3) {
    const prefixes = ['DT-', 'GC-', 'TC-'];
    const hasValidPrefix = prefixes.some(prefix =>
      deviceTag.toUpperCase().startsWith(prefix));

    if (hasValidPrefix || deviceTag.length >= 8) {
      setTimeout(() => {
        if (event.target.value.trim() === deviceTag) {
          addModalDeviceToList(deviceTag);
          event.target.value = '';
        }
      }, 200);
    }
  }
}

/**
 * Handle modal device keydown
 */
function handleModalDeviceKeydown(event) {
  // Handle scanner terminators (Enter, Tab)
  if ([13, 9].includes(event.keyCode)) {
    event.preventDefault();

    const deviceTag = event.target.value.trim();
    if (deviceTag.length >= 3) {
      addModalDeviceToList(deviceTag);
      event.target.value = '';
    }
  }
}

/**
 * Add device to modal list
 */
function addModalDeviceToList(deviceTag) {
  // Check if device already exists
  const existingDevice = window.modalGuestState.devices.find(device =>
    device.deviceTag.toUpperCase() === deviceTag.toUpperCase());

  if (existingDevice) {
    showModalTemporaryMessage('Device already scanned!', 'warning');
    return;
  }

  // Generate device data
  const deviceId = `modal_device_${++window.modalGuestState.deviceCounter}`;
  const serialNumber = generateModalSerialNumber(deviceTag);
  const scannedTime = new Date();

  const newDevice = {
    id: deviceId,
    deviceTag: deviceTag.toUpperCase(),
    serialNumber: serialNumber,
    scannedTime: scannedTime,
    scannedTimeFormatted: formatModalScanTime(scannedTime)
  };

  window.modalGuestState.devices.push(newDevice);

  // Update UI
  renderModalDeviceList();
  updateModalDeviceCount();
  clearModalValidationErrors();
}

/**
 * Generate serial number for modal device
 */
function generateModalSerialNumber(deviceTag) {
  const brands = ['LEN', 'HP', 'DEL', 'ASU', 'ACE', 'SAM', 'APP'];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const number = Math.floor(Math.random() * 90000) + 10000;
  return `SN-${brand}-${number}`;
}

/**
 * Format scan time for modal
 */
function formatModalScanTime(date) {
  const timeString = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  return timeString;
}

/**
 * Render modal device list
 */
function renderModalDeviceList() {
  const tableBody = document.getElementById('modalDeviceTableBody');
  const emptyState = document.getElementById('modalEmptyDeviceState');

  if (!tableBody || !emptyState) return;

  tableBody.innerHTML = '';

  if (window.modalGuestState.devices.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  window.modalGuestState.devices.forEach(device => {
    const row = createModalDeviceRow(device);
    tableBody.appendChild(row);
  });
}

/**
 * Create modal device row
 */
function createModalDeviceRow(device) {
  const row = document.createElement('tr');
  row.className = 'fade-in';
  row.innerHTML = `
    <td class="device-tag-cell">${device.deviceTag}</td>
    <td>
      <input type="text" class="serial-input" value="${device.serialNumber}" 
             onchange="updateModalDeviceSerial('${device.id}', this.value)"
             placeholder="Enter serial number">
    </td>
    <td class="scan-time-cell">
      <div class="time-display">
        <i data-lucide="clock" class="time-icon"></i>
        <span class="time-text">${device.scannedTimeFormatted}</span>
      </div>
    </td>
    <td>
      <button class="remove-device-btn" onclick="removeModalDevice('${device.id}')" 
              title="Remove device">
        <i data-lucide="x" class="remove-icon"></i>
        ❌
      </button>
    </td>
  `;

  setTimeout(() => {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 0);

  return row;
}

/**
 * Update modal device count
 */
function updateModalDeviceCount() {
  const countElement = document.getElementById('modalDeviceCount');
  if (countElement) {
    const count = window.modalGuestState.devices.length;
    countElement.textContent = `${count} device${count !== 1 ? 's' : ''}`;
  }
}

/**
 * Handle modal action toggle
 */
function handleModalActionToggle(action) {
  updateModalActionState(action);
}

/**
 * Update modal action state
 */
function updateModalActionState(action) {
  window.modalGuestState.currentAction = action;

  const checkInBtn = document.getElementById('modalCheckInBtn');
  const checkOutBtn = document.getElementById('modalCheckOutBtn');
  const actionStatus = document.getElementById('modalActionStatus');

  if (checkInBtn && checkOutBtn) {
    checkInBtn.classList.toggle('active', action === 'check-in');
    checkOutBtn.classList.toggle('active', action === 'check-out');
  }

  if (actionStatus) {
    const statusText = actionStatus.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = `Mode: Visitor ${action === 'check-in' ? 'Check-In' : 'Check-Out'}`;
    }
  }

  // Update modal styling for check-out mode
  const modal = document.getElementById('guestModal');
  if (modal) {
    modal.classList.toggle('checkout-mode', action === 'check-out');
  }
}

/**
 * Handle modal process guest
 */
function handleModalProcessGuest() {
  if (window.modalGuestState.isProcessing) return;

  // Validate input
  const validation = validateModalGuestInput();
  if (!validation.isValid) {
    showModalValidationErrors(validation.errors);
    return;
  }

  clearModalValidationErrors();

  // Start processing
  window.modalGuestState.isProcessing = true;
  const processBtn = document.getElementById('modalProcessGuestBtn');
  if (processBtn) {
    processBtn.disabled = true;
    processBtn.innerHTML = '<i data-lucide="loader" class="process-icon"></i><span>Processing...</span>';

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  setTimeout(() => {
    processModalGuestTransaction();
  }, 1500);
}

/**
 * Validate modal guest input
 */
function validateModalGuestInput() {
  const errors = [];

  if (!window.modalGuestState.guestCard || window.modalGuestState.guestCard.length < 3) {
    errors.push('Guest card number is required');
  }

  if (window.modalGuestState.devices.length === 0) {
    errors.push('At least one device must be scanned');
  }

  const devicesWithoutSerial = window.modalGuestState.devices.filter(d => !d.serialNumber.trim());
  if (devicesWithoutSerial.length > 0) {
    errors.push('All devices must have serial numbers');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Process modal guest transaction
 */
function processModalGuestTransaction() {
  const transaction = {
    id: `modal-guest-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    guestCard: window.modalGuestState.guestCard,
    action: window.modalGuestState.currentAction,
    devices: [...window.modalGuestState.devices],
    guardName: document.getElementById('guardName')?.textContent || 'Unknown',
    processed: true
  };

  console.log('💾 Modal Guest Transaction Processed:', transaction);

  showModalSuccessMessage();

  setTimeout(() => {
    resetGuestModal();
    closeGuestModal();
  }, 2000);
}

/**
 * Show modal success message
 */
function showModalSuccessMessage() {
  const successMessage = document.getElementById('modalSuccessMessage');
  const successText = document.getElementById('modalSuccessText');

  if (successMessage && successText) {
    const actionText = window.modalGuestState.currentAction === 'check-in' ? 'Registration' : 'Check-Out';
    successText.textContent = `✅ Visitor ${actionText} Successful`;

    successMessage.style.display = 'flex';
    successMessage.classList.add('fade-in');
  }

  // Complete processing
  window.modalGuestState.isProcessing = false;
  const processBtn = document.getElementById('modalProcessGuestBtn');
  if (processBtn) {
    processBtn.disabled = false;
    processBtn.innerHTML = '<i data-lucide="save" class="process-icon"></i><span>🔐 REGISTER VISITOR</span>';

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

/**
 * Show modal validation errors
 */
function showModalValidationErrors(errors) {
  const errorContainer = document.getElementById('modalValidationErrors');
  if (!errorContainer || errors.length === 0) return;

  const errorList = errors.map(error => `<li>${error}</li>`).join('');
  errorContainer.innerHTML = `
    <strong>Please fix the following errors:</strong>
    <ul>${errorList}</ul>
  `;

  errorContainer.style.display = 'block';
  errorContainer.classList.add('fade-in');
}

/**
 * Clear modal validation errors
 */
function clearModalValidationErrors() {
  const errorContainer = document.getElementById('modalValidationErrors');
  if (errorContainer) {
    errorContainer.style.display = 'none';
  }
}

/**
 * Show modal temporary message
 */
function showModalTemporaryMessage(message, type = 'info') {
  const messageEl = document.createElement('div');
  messageEl.className = `temp-message temp-message-${type}`;
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'warning' ? '#fff3cd' : '#d4edda'};
    border: 1px solid ${type === 'warning' ? '#ffeaa7' : '#c3e6cb'};
    color: ${type === 'warning' ? '#856404' : '#155724'};
    padding: 12px 16px;
    border-radius: 4px;
    z-index: 2000;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  `;

  document.body.appendChild(messageEl);

  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 3000);
}

/**
 * Reset modal state
 */
function resetGuestModal() {
  if (!window.modalGuestState) return;

  // Clear guest card
  window.modalGuestState.guestCard = '';
  const cardInput = document.getElementById('modalGuestCardNumber');
  if (cardInput) {
    cardInput.value = '';
  }

  // Clear card confirmation
  const cardConfirmation = document.getElementById('modalCardConfirmation');
  if (cardConfirmation) {
    cardConfirmation.style.display = 'none';
  }

  // Clear devices
  window.modalGuestState.devices = [];
  renderModalDeviceList();
  updateModalDeviceCount();

  // Clear device input
  const deviceInput = document.getElementById('modalDeviceTagInput');
  if (deviceInput) {
    deviceInput.value = '';
  }

  // Reset to check-in mode
  updateModalActionState('check-in');

  // Hide success message
  const successMessage = document.getElementById('modalSuccessMessage');
  if (successMessage) {
    successMessage.style.display = 'none';
  }

  // Clear validation errors
  clearModalValidationErrors();
}

// Global functions for modal device management
window.updateModalDeviceSerial = function (deviceId, newSerial) {
  const device = window.modalGuestState.devices.find(d => d.id === deviceId);
  if (device) {
    device.serialNumber = newSerial.trim();
  }
};

window.removeModalDevice = function (deviceId) {
  window.modalGuestState.devices = window.modalGuestState.devices.filter(d => d.id !== deviceId);
  renderModalDeviceList();
  updateModalDeviceCount();
};

/**
 * Handle entry/exit toggle change
 * @param {Event} event - Change event from the toggle
 */
function handleEntryExitToggle(event) {
  const isChecked = event.target.checked;
  const toggleText = document.getElementById('toggleText');

  if (isChecked) {
    // Toggle is ON - ENTRY mode (green)
    appState.currentMode = 'check-in';
    toggleText.textContent = 'ENTRY';

    // Switch to green theme
    document.body.classList.remove('exit-mode');
    document.body.classList.add('entry-mode');
  } else {
    // Toggle is OFF - EXIT mode (red)
    appState.currentMode = 'check-out';
    toggleText.textContent = 'EXIT';

    // Switch to red theme
    document.body.classList.remove('entry-mode');
    document.body.classList.add('exit-mode');
  }

  // Update process button text
  updateProcessButtonText(appState.currentMode);
}

/**
 * Handle mode toggle between check-in and check-out
 * @param {string} mode - Mode to switch to ('check-in' or 'check-out')
 */
function handleModeToggle(mode) {
  // Update application state
  appState.currentMode = mode;

  // Update the entry/exit toggle to match the mode
  const entryExitToggle = document.getElementById('entryExitToggle');
  const toggleText = document.getElementById('toggleText');

  if (entryExitToggle && toggleText) {
    if (mode === 'check-in') {
      entryExitToggle.checked = true;
      toggleText.textContent = 'ENTRY';
    } else {
      entryExitToggle.checked = false;
      toggleText.textContent = 'EXIT';
    }
  }

  // Update process button text
  updateProcessButtonText(mode);
}

/**
 * Update the process button text based on current mode
 * @param {string} mode - Current mode ('check-in' or 'check-out')
 */
function updateProcessButtonText(mode) {
  const processBtn = document.getElementById('processBtn');
  if (processBtn) {
    if (mode === 'check-in') {
      processBtn.textContent = 'PROCESS CHECK-IN';
    } else {
      processBtn.textContent = 'PROCESS CHECK-OUT';
    }
  }
}

/**
 * Validate card ID format
 * Expected format: NV-XXX-XXX-#### (e.g., NV-CON-LAP-9876)
 * @param {string} cardId - Card ID to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateCardIdFormat(cardId) {
  if (!cardId || cardId.trim() === '') {
    return {
      isValid: false,
      error: 'Access Card ID is required'
    };
  }

  // Pattern: NV-XXX-XXX-#### (letters and numbers, separated by hyphens)
  const pattern = /^NV-[A-Z]{3}-[A-Z]{3}-\d{4}$/i;

  if (!pattern.test(cardId)) {
    return {
      isValid: false,
      error: 'Invalid format. Expected: NV-XXX-XXX-#### (e.g., NV-CON-LAP-9876)'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate device tag format
 * Expected format: NV-XXX-XXX-#### (e.g., NV-CON-MAK-9468)
 * @param {string} deviceTag - Device tag to validate
 * @returns {Object} Validation result with isValid flag and error message
 */
function validateDeviceTagFormat(deviceTag) {
  if (!deviceTag || deviceTag.trim() === '') {
    return {
      isValid: false,
      error: 'Device Tag is required'
    };
  }

  // Pattern: NV-XXX-XXX-#### (letters and numbers, separated by hyphens)
  const pattern = /^NV-[A-Z]{3}-[A-Z]{3}-\d{4}$/i;

  if (!pattern.test(deviceTag)) {
    return {
      isValid: false,
      error: 'Invalid format. Expected: NV-XXX-XXX-#### (e.g., NV-CON-MAK-9468)'
    };
  }

  return {
    isValid: true,
    error: null
  };
}

/**
 * Display field-level error message
 * @param {string} fieldId - ID of the input field
 * @param {string} errorMessage - Error message to display
 */
function showFieldError(fieldId, errorMessage) {
  const inputField = document.getElementById(fieldId);
  const inputGroup = inputField.closest('.input-group');

  // Add error class to input field
  inputField.classList.add('error');

  // Remove any existing error message
  const existingError = inputGroup.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  // Create and append error message
  const errorElement = document.createElement('div');
  errorElement.className = 'field-error';
  errorElement.textContent = errorMessage;
  inputGroup.appendChild(errorElement);
}

/**
 * Clear field-level error message
 * @param {string} fieldId - ID of the input field
 */
function clearFieldError(fieldId) {
  const inputField = document.getElementById(fieldId);
  const inputGroup = inputField.closest('.input-group');

  // Remove error class from input field
  inputField.classList.remove('error');

  // Remove error message
  const existingError = inputGroup.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }
}

/**
 * Handle real-time validation for card ID field
 * @param {Event} event - Input event
 */
function handleCardIdValidation(event) {
  const cardId = event.target.value.trim();

  // Don't validate if field is empty (only show error on blur or submit)
  if (cardId === '') {
    clearFieldError('cardId');
    return;
  }

  const validation = validateCardIdFormat(cardId);

  if (!validation.isValid) {
    showFieldError('cardId', validation.error);
  } else {
    clearFieldError('cardId');
  }
}

/**
 * Handle real-time validation for device tag field
 * @param {Event} event - Input event
 */
function handleDeviceTagValidation(event) {
  const deviceTag = event.target.value.trim();

  // Don't validate if field is empty (only show error on blur or submit)
  if (deviceTag === '') {
    clearFieldError('deviceTag');
    return;
  }

  const validation = validateDeviceTagFormat(deviceTag);

  if (!validation.isValid) {
    showFieldError('deviceTag', validation.error);
  } else {
    clearFieldError('deviceTag');
  }
}

/**
 * Validate input fields for transaction processing
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateInputs() {
  const cardId = document.getElementById('cardId').value.trim();
  const deviceTag = document.getElementById('deviceTag').value.trim();

  const errors = [];
  let isValid = true;

  // Validate card ID
  const cardIdValidation = validateCardIdFormat(cardId);
  if (!cardIdValidation.isValid) {
    errors.push(cardIdValidation.error);
    showFieldError('cardId', cardIdValidation.error);
    isValid = false;
  } else {
    clearFieldError('cardId');
  }

  // Validate device tag
  const deviceTagValidation = validateDeviceTagFormat(deviceTag);
  if (!deviceTagValidation.isValid) {
    errors.push(deviceTagValidation.error);
    showFieldError('deviceTag', deviceTagValidation.error);
    isValid = false;
  } else {
    clearFieldError('deviceTag');
  }

  return {
    isValid: isValid,
    errors: errors,
    cardId: cardId,
    deviceTag: deviceTag
  };
}

/**
 * Display validation errors to the user
 * @param {Array} errors - Array of error messages
 */
function displayValidationErrors(errors) {
  // Remove any existing error messages
  clearValidationErrors();

  if (errors.length === 0) return;

  // Create error container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'validation-errors';
  errorContainer.id = 'validationErrors';

  // Add error messages
  errors.forEach(error => {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = error;
    errorContainer.appendChild(errorMessage);
  });

  // Insert error container before the process button
  const processBtn = document.getElementById('processBtn');
  processBtn.parentNode.insertBefore(errorContainer, processBtn);
}

/**
 * Clear validation error messages
 */
function clearValidationErrors() {
  const existingErrors = document.getElementById('validationErrors');
  if (existingErrors) {
    existingErrors.remove();
  }
}

/**
 * Generate a unique transaction ID
 * @returns {string} Unique transaction ID
 */
function generateTransactionId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `txn-${timestamp}-${random}`;
}

/**
 * Create a new transaction object from input values
 * @param {string} cardId - Access card ID
 * @param {string} deviceTag - Device tag number
 * @param {string} mode - Transaction mode ('check-in' or 'check-out')
 * @returns {Object} New transaction object
 */
function createTransaction(cardId, deviceTag, mode) {
  // For demo purposes, we'll use a default card holder name
  // In a real system, this would be looked up from a database
  const cardHolder = "New User";

  // Determine transaction type based on mode
  const type = mode === 'check-in' ? 'IN' : 'OUT';

  // For demo purposes, all new transactions are authorized
  // In a real system, this would be validated against authorization rules
  const isAuthorized = true;
  const status = isAuthorized ? 'authorized' : 'unauthorized';

  return {
    id: generateTransactionId(),
    timestamp: new Date().toISOString(),
    cardHolder: cardHolder,
    cardId: cardId,
    assetTag: deviceTag,
    type: type,
    status: status,
    isAuthorized: isAuthorized
  };
}

/**
 * Clear input fields after successful transaction
 */
function clearInputFields() {
  document.getElementById('cardId').value = '';
  document.getElementById('deviceTag').value = '';

  // Clear any validation errors
  clearFieldError('cardId');
  clearFieldError('deviceTag');

  // Note: We don't clear the trace asset field as it's for search functionality
}

/**
 * Handle transaction processing
 */
function handleProcessTransaction() {
  // Validate input fields
  const validation = validateInputs();

  if (!validation.isValid) {
    // Validation errors are already displayed at field level
    // Prevent form submission
    return;
  }

  // Create new transaction object
  const newTransaction = createTransaction(
    validation.cardId,
    validation.deviceTag,
    appState.currentMode
  );

  // Add transaction to the beginning of the array (most recent first)
  appState.transactions.unshift(newTransaction);

  // Update statistics
  updateStateStatistics();

  // Clear search query if active
  const traceAssetInput = document.getElementById('traceAsset');
  if (traceAssetInput && appState.searchQuery) {
    traceAssetInput.value = '';
    appState.searchQuery = '';
  }

  // Update all UI components
  updateStatisticsFromState();
  renderTable(appState.transactions, appState.currentFilter);

  // Update Watchlist
  updateWatchlistFromState();

  // Clear input fields
  clearInputFields();

  // Optional: Show success feedback (subtle visual indication)
  showSuccessFeedback();
}

/**
 * Show success feedback after transaction processing
 */
function showSuccessFeedback() {
  const processBtn = document.getElementById('processBtn');

  // Add success class temporarily
  processBtn.classList.add('success');

  // Remove success class after animation
  setTimeout(() => {
    processBtn.classList.remove('success');
  }, 1000);
}

/**
 * Handle refresh button click
 * Reloads transaction data and updates all components
 */
function handleRefresh() {
  const refreshBtn = document.getElementById('refreshBtn');

  // Add loading class for visual feedback
  if (refreshBtn) {
    refreshBtn.classList.add('loading');
    refreshBtn.disabled = true;
  }

  // Simulate data reload (in a real system, this would fetch from server)
  // Using setTimeout to simulate network delay
  setTimeout(() => {
    // Reload transaction data
    reloadTransactionData();

    // Update statistics from reloaded data
    updateStateStatistics();

    // Clear search query if active
    const traceAssetInput = document.getElementById('traceAsset');
    if (traceAssetInput && appState.searchQuery) {
      traceAssetInput.value = '';
      appState.searchQuery = '';
    }

    // Update all UI components
    updateStatisticsFromState();
    renderTable(appState.transactions, appState.currentFilter);

    // Update Watchlist
    updateWatchlistFromState();

    // Remove loading class and re-enable button
    if (refreshBtn) {
      refreshBtn.classList.remove('loading');
      refreshBtn.disabled = false;
    }
  }, 800); // 800ms delay to show loading animation
}

/**
 * Handle export button click
 * Exports the current table data to CSV format
 */
function handleExport() {
  const exportBtn = document.getElementById('exportBtn');

  // Add visual feedback
  if (exportBtn) {
    exportBtn.classList.add('exporting');
    exportBtn.disabled = true;
  }

  // Small delay for visual feedback
  setTimeout(() => {
    // Call the export function from ui.js
    exportTableData();

    // Remove visual feedback
    if (exportBtn) {
      exportBtn.classList.remove('exporting');
      exportBtn.disabled = false;
    }
  }, 200);
}

/**
 * Handle flag as missing/stolen button click
 * Opens a confirmation dialog and flags the selected asset
 */
function handleFlagAsset() {
  // Get the most recent transaction (if any)
  if (appState.transactions.length === 0) {
    alert('No assets to flag. Please process a transaction first.');
    return;
  }

  // Get the most recent transaction
  const recentTransaction = appState.transactions[0];

  // Build confirmation message
  let confirmMessage = 'FLAG ASSET AS MISSING/STOLEN\n';
  confirmMessage += '='.repeat(50) + '\n\n';
  confirmMessage += `Asset Tag: ${recentTransaction.assetTag}\n`;
  confirmMessage += `Card Holder: ${recentTransaction.cardHolder}\n`;
  confirmMessage += `Card ID: ${recentTransaction.cardId}\n`;
  confirmMessage += `Last Activity: ${formatTime(recentTransaction.timestamp)}\n`;
  confirmMessage += `Status: ${recentTransaction.type}\n\n`;
  confirmMessage += 'Are you sure you want to flag this asset as MISSING/STOLEN?\n';
  confirmMessage += 'This action will be logged and reported to security.';

  // Show confirmation dialog
  const confirmed = confirm(confirmMessage);

  if (confirmed) {
    // Log the flag action to console
    console.log('='.repeat(60));
    console.log('ASSET FLAGGED AS MISSING/STOLEN');
    console.log('='.repeat(60));
    console.log('Timestamp:', new Date().toISOString());
    console.log('Asset Tag:', recentTransaction.assetTag);
    console.log('Card Holder:', recentTransaction.cardHolder);
    console.log('Card ID:', recentTransaction.cardId);
    console.log('Last Activity:', recentTransaction.timestamp);
    console.log('Last Status:', recentTransaction.type);
    console.log('Flagged By:', appState.guardName);
    console.log('='.repeat(60));

    // Show success feedback to user
    showFlagSuccessFeedback(recentTransaction.assetTag);
  }
}

/**
 * Handle Export Incident Log button click
 * Exports only unauthorized transactions to CSV format
 */
function handleExportIncidentLog() {
  const exportBtn = document.getElementById('watchlistExportBtn');

  // Add visual feedback
  if (exportBtn) {
    exportBtn.classList.add('exporting');
    exportBtn.disabled = true;
  }

  setTimeout(() => {
    // Get unauthorized transactions
    const unauthorizedTransactions = getUnauthorizedTransactions(appState.transactions);

    if (unauthorizedTransactions.length === 0) {
      alert('No incidents to export.');
      if (exportBtn) {
        exportBtn.classList.remove('exporting');
        exportBtn.disabled = false;
      }
      return;
    }

    // Sort by timestamp descending
    unauthorizedTransactions.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    // Convert to CSV
    const csvContent = convertToCSV(unauthorizedTransactions);

    // Generate filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = `incident_log_${dateStr}_${timeStr}.csv`;

    // Trigger download
    downloadFile(csvContent, filename, 'text/csv');

    // Remove visual feedback
    if (exportBtn) {
      exportBtn.classList.remove('exporting');
      exportBtn.disabled = false;
    }
  }, 200);
}

/**
 * Initialize Watchlist event listeners
 * Attaches event handlers to Watchlist action buttons
 */
function initializeWatchlistListeners() {
  // Export Incident Log button
  const exportBtn = document.getElementById('watchlistExportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportIncidentLog);
  }

  // Flag button (reuse existing handler)
  const flagBtn = document.getElementById('watchlistFlagBtn');
  if (flagBtn) {
    flagBtn.addEventListener('click', handleFlagAsset);
  }
}

/**
 * Show success feedback after flagging an asset
 * @param {string} assetTag - The asset tag that was flagged
 */
function showFlagSuccessFeedback(assetTag) {
  // Create a success message
  const message = `Asset ${assetTag} has been flagged as MISSING/STOLEN.\n\nSecurity has been notified and the incident has been logged.`;

  // Show alert with success message
  alert(message);

  // Add visual feedback to the flag button
  const flagBtn = document.getElementById('flagBtn');
  if (flagBtn) {
    // Store original HTML
    const originalHTML = flagBtn.innerHTML;

    // Change button to show success state
    flagBtn.innerHTML = '<i data-lucide="check-circle" class="icon-flag"></i> FLAGGED SUCCESSFULLY';
    flagBtn.classList.add('flagged');
    flagBtn.disabled = true;

    // Reinitialize Lucide icons for the new icon
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Reset button after 3 seconds
    setTimeout(() => {
      flagBtn.innerHTML = originalHTML;
      flagBtn.classList.remove('flagged');
      flagBtn.disabled = false;

      // Reinitialize Lucide icons again
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 3000);
  }
}

/**
 * Generate a random transaction for simulation purposes
 * @returns {Object} New transaction object
 */
function generateRandomTransaction() {
  // Sample card holders
  const cardHolders = [
    "Michael Opio", "Susan Namukasa", "Patrick Lubega", "Jane Akello",
    "Daniel Ssebunya", "Ruth Namusoke", "Joseph Kizza", "Betty Nakimuli",
    "Andrew Muwanga", "Florence Nabirye", "Samuel Okoth", "Esther Nambi"
  ];

  // Randomly select a card holder
  const cardHolder = cardHolders[Math.floor(Math.random() * cardHolders.length)];

  // Generate random card ID
  const cardIdNum = Math.floor(Math.random() * 9000) + 1000;
  const cardId = `INV-CON-LAP-${cardIdNum}`;

  // Generate random asset tag
  const assetTagNum = Math.floor(Math.random() * 9000) + 1000;
  const assetTag = `INV-CON-MAK-${assetTagNum}`;

  // Randomly determine transaction type (70% IN, 30% OUT)
  const type = Math.random() < 0.7 ? 'IN' : 'OUT';

  // Randomly determine authorization status (90% authorized, 10% unauthorized)
  const isAuthorized = Math.random() < 0.9;
  const status = isAuthorized ? 'authorized' : 'unauthorized';

  return {
    id: generateTransactionId(),
    timestamp: new Date().toISOString(),
    cardHolder: cardHolder,
    cardId: cardId,
    assetTag: assetTag,
    type: type,
    status: status,
    isAuthorized: isAuthorized
  };
}

/**
 * Simulate checking for new transaction data
 * Returns new transactions if any are available
 * @returns {Array} Array of new transactions (empty if no new data)
 */
function checkForNewTransactions() {
  // Simulate random chance of new transactions (30% chance)
  const hasNewData = Math.random() < 0.3;

  if (!hasNewData) {
    return [];
  }

  // Generate 1-2 new transactions
  const numTransactions = Math.random() < 0.7 ? 1 : 2;
  const newTransactions = [];

  for (let i = 0; i < numTransactions; i++) {
    newTransactions.push(generateRandomTransaction());
  }

  return newTransactions;
}

/**
 * Show subtle visual indicator during refresh
 */
function showRefreshIndicator() {
  const indicator = document.getElementById('refreshIndicator');

  if (indicator) {
    indicator.classList.add('active');
  }
}

/**
 * Hide refresh indicator
 */
function hideRefreshIndicator() {
  const indicator = document.getElementById('refreshIndicator');

  if (indicator) {
    indicator.classList.remove('active');
  }
}

/**
 * Process auto-refresh update
 * Checks for new data and updates UI components if new data is available
 */
function processAutoRefresh() {
  // Show refresh indicator
  showRefreshIndicator();

  // Check for new transactions
  const newTransactions = checkForNewTransactions();

  // If no new data, hide indicator and return
  if (newTransactions.length === 0) {
    setTimeout(hideRefreshIndicator, 500);
    return;
  }

  // Add new transactions to the beginning of the array
  newTransactions.forEach(transaction => {
    appState.transactions.unshift(transaction);
  });

  // Update statistics
  updateStateStatistics();

  // Update all UI components
  updateStatisticsFromState();

  // If there's an active search query, maintain it
  if (appState.searchQuery) {
    const searchResults = searchTransactions(appState.searchQuery);
    renderTableWithSearch(searchResults, appState.currentFilter, appState.searchQuery);
  } else {
    renderTable(appState.transactions, appState.currentFilter);
  }

  // Update Watchlist
  updateWatchlistFromState();

  // Hide refresh indicator after a short delay
  setTimeout(hideRefreshIndicator, 800);

  // Log to console for debugging
  console.log(`Auto-refresh: ${newTransactions.length} new transaction(s) added`);
}

/**
 * Initialize auto-refresh mechanism
 * Sets up interval to check for updates every 5 seconds
 */
function initializeAutoRefresh() {
  // Check for updates every 5 seconds (5000 milliseconds)
  setInterval(processAutoRefresh, 5000);

  console.log('Auto-refresh mechanism initialized (checking every 5 seconds)');
}
