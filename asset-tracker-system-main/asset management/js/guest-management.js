// Guest Management System JavaScript
// Professional Security Desk Interface

/**
 * Guest Management Application State
 */
const guestState = {
    currentAction: 'check-in', // 'check-in' or 'check-out'
    guestCard: '',
    guestName: '',
    guestCompany: '',
    guestPurpose: '',
    hostEmployee: '',
    guestNotes: '',
    devices: [], // Array of {deviceTag, serialNumber, id}
    deviceCounter: 0,
    isProcessing: false,
    scannerTimeout: null,
    fastInputThreshold: 100, // milliseconds - typical scanner input speed
    lastInputTime: 0,
    existingGuest: null, // Stores existing guest data if found
    activeGuests: [], // Simulated database of active guests
    guestHistory: [] // Simulated database of all guests
};

/**
 * Scanner Detection Configuration
 * Barcode scanners typically input data very quickly (under 100ms)
 * and often end with Enter key or specific terminator
 */
const scannerConfig = {
    minLength: 3, // Minimum characters for valid scan
    maxInputTime: 100, // Maximum time between characters (ms)
    terminators: [13, 9], // Enter key (13) and Tab (9)
    prefixes: ['DT-', 'GC-', 'TC-'] // Common prefixes for device tags and guest cards
};

/**
 * Initialize the Guest Management System
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Guest Management System Initializing...');
    
    // Initialize header with current date and guard info
    initializeGuestHeader();
    
    // Set up all event listeners
    setupGuestEventListeners();
    
    // Initialize scanner detection
    initializeScannerDetection();
    
    // Initialize footer clock
    initializeGuestFooterClock();
    
    // Set default action state
    updateActionState('check-in');
    
    console.log('✅ Guest Management System Ready');
});

/**
 * Initialize guest system header
 */
function initializeGuestHeader() {
    const guardName = document.getElementById('guardName');
    const headerDate = document.getElementById('headerDate');
    
    if (guardName) {
        guardName.textContent = 'Alex Gitta'; // Default guard name
    }
    
    if (headerDate) {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        headerDate.textContent = now.toLocaleDateString('en-GB', options);
    }
}

/**
 * Initialize footer clock
 */
function initializeGuestFooterClock() {
    const footerTimestamp = document.getElementById('footerTimestamp');
    
    function updateClock() {
        const now = new Date();
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        
        const timeString = now.toLocaleDateString('en-GB', options) + ' EAT';
        if (footerTimestamp) {
            footerTimestamp.textContent = timeString;
            footerTimestamp.setAttribute('datetime', now.toISOString());
        }
    }
    
    // Update immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);
}

/**
 * Set up all event listeners for the guest system
 */
function setupGuestEventListeners() {
    // Fixed exit button (top-right corner)
    const fixedExitBtn = document.getElementById('fixedExitBtn');
    if (fixedExitBtn) {
        fixedExitBtn.addEventListener('click', handleBackToMain);
    }
    
    // Back to main system button
    const backBtn = document.getElementById('backToMainBtn');
    if (backBtn) {
        backBtn.addEventListener('click', handleBackToMain);
    }
    
    // Exit button in header
    const exitBtn = document.getElementById('exitGuestSystemBtn');
    if (exitBtn) {
        exitBtn.addEventListener('click', handleBackToMain);
    }
    
    // Guest search input
    const searchInput = document.getElementById('guestSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleGuestSearch, 300));
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim()) {
                handleGuestSearch({ target: searchInput });
            }
        });
    }
    
    // Click outside to close search results
    document.addEventListener('click', (e) => {
        const searchResults = document.getElementById('searchResults');
        const searchInput = document.getElementById('guestSearch');
        if (searchResults && !searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });
    
    // Guest card input
    const cardInput = document.getElementById('guestCardNumber');
    if (cardInput) {
        cardInput.addEventListener('input', handleCardInput);
        cardInput.addEventListener('keydown', handleCardKeydown);
        cardInput.addEventListener('blur', handleCardBlur);
    }
    
    // Guest detail inputs
    const guestName = document.getElementById('guestName');
    const guestCompany = document.getElementById('guestCompany');
    const guestPurpose = document.getElementById('guestPurpose');
    const hostEmployee = document.getElementById('hostEmployee');
    const guestNotes = document.getElementById('guestNotes');
    
    if (guestName) guestName.addEventListener('input', (e) => guestState.guestName = e.target.value.trim());
    if (guestCompany) guestCompany.addEventListener('input', (e) => guestState.guestCompany = e.target.value.trim());
    if (guestPurpose) guestPurpose.addEventListener('change', (e) => guestState.guestPurpose = e.target.value);
    if (hostEmployee) hostEmployee.addEventListener('input', (e) => guestState.hostEmployee = e.target.value.trim());
    if (guestNotes) guestNotes.addEventListener('input', (e) => guestState.guestNotes = e.target.value.trim());
    
    // Device tag input
    const deviceInput = document.getElementById('deviceTagInput');
    if (deviceInput) {
        deviceInput.addEventListener('input', handleDeviceInput);
        deviceInput.addEventListener('keydown', handleDeviceKeydown);
    }
    
    // Action buttons (Check-In / Check-Out)
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    
    if (checkInBtn) {
        checkInBtn.addEventListener('click', () => handleActionToggle('check-in'));
    }
    
    if (checkOutBtn) {
        checkOutBtn.addEventListener('click', () => handleActionToggle('check-out'));
    }
    
    // Process guest button
    const processBtn = document.getElementById('processGuestBtn');
    if (processBtn) {
        processBtn.addEventListener('click', handleProcessGuest);
    }
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize with sample data for testing
    initializeSampleData();
}

/**
 * Initialize scanner detection for fast input recognition
 */
function initializeScannerDetection() {
    console.log('🔍 Scanner detection initialized');
    
    // Monitor all input fields for scanner-like behavior
    document.addEventListener('input', function(event) {
        if (event.target.classList.contains('scanner-input')) {
            detectScannerInput(event);
        }
    });
}

/**
 * Detect if input is coming from a barcode scanner
 * Scanners typically input data very quickly
 */
function detectScannerInput(event) {
    const input = event.target;
    const currentTime = Date.now();
    const timeDiff = currentTime - guestState.lastInputTime;
    
    // Check if this looks like scanner input (fast typing)
    if (timeDiff < scannerConfig.maxInputTime && input.value.length > 1) {
        // Mark as scanner input
        input.classList.add('fast-input', 'scanning');
        
        // Update scanner indicator
        const indicator = input.parentElement.querySelector('.scanner-indicator');
        if (indicator) {
            indicator.classList.add('scanning');
            const indicatorText = indicator.querySelector('span');
            if (indicatorText) {
                indicatorText.textContent = 'Scanning...';
            }
        }
        
        // Clear scanner styling after a delay
        clearTimeout(guestState.scannerTimeout);
        guestState.scannerTimeout = setTimeout(() => {
            input.classList.remove('fast-input', 'scanning');
            if (indicator) {
                indicator.classList.remove('scanning');
                const indicatorText = indicator.querySelector('span');
                if (indicatorText) {
                    indicatorText.textContent = input.id === 'guestCardNumber' ? 
                        'Ready to scan...' : 'Ready to scan device...';
                }
            }
        }, 1500);
    }
    
    guestState.lastInputTime = currentTime;
}

/**
 * Handle guest card input
 */
function handleCardInput(event) {
    const cardNumber = event.target.value.trim();
    guestState.guestCard = cardNumber;
    
    // Clear validation errors if card is entered
    if (cardNumber.length > 0) {
        clearValidationErrors();
    }
}

/**
 * Handle card blur - check for duplicates and existing guests
 */
function handleCardBlur(event) {
    const cardNumber = event.target.value.trim();
    
    if (cardNumber.length >= scannerConfig.minLength) {
        checkCardStatus(cardNumber);
    }
}

/**
 * Check card status - duplicate detection and existing guest lookup
 */
function checkCardStatus(cardNumber) {
    const alertContainer = document.getElementById('cardStatusAlert');
    if (!alertContainer) return;
    
    // Check if guest is already checked in
    const activeGuest = guestState.activeGuests.find(g => 
        g.cardNumber.toUpperCase() === cardNumber.toUpperCase() && g.status === 'checked-in'
    );
    
    if (activeGuest) {
        // Guest is already checked in
        guestState.existingGuest = activeGuest;
        
        if (guestState.currentAction === 'check-in') {
            showCardAlert('warning', 'Duplicate Check-In Detected', 
                `${activeGuest.name} is already checked in at ${formatTime(activeGuest.checkInTime)}. Switch to Check-Out mode?`);
            
            // Auto-switch to check-out mode
            setTimeout(() => {
                handleActionToggle('check-out');
            }, 2000);
        } else {
            // Check-out mode - show guest info
            showCardAlert('success', 'Guest Found', 
                `Ready to check out ${activeGuest.name} from ${activeGuest.company}`);
            prefillGuestDetails(activeGuest);
        }
        return;
    }
    
    // Check if guest exists in history (returning visitor)
    const historicalGuest = guestState.guestHistory.find(g => 
        g.cardNumber.toUpperCase() === cardNumber.toUpperCase()
    );
    
    if (historicalGuest && guestState.currentAction === 'check-in') {
        guestState.existingGuest = historicalGuest;
        showCardAlert('info', 'Welcome Back!', 
            `${historicalGuest.name} last visited on ${formatDate(historicalGuest.lastVisit)}`);
        prefillGuestDetails(historicalGuest);
        return;
    }
    
    // New guest
    if (guestState.currentAction === 'check-in') {
        showCardAlert('success', 'New Guest', 'Please fill in guest details below');
        guestState.existingGuest = null;
        clearGuestDetails();
    } else {
        // Trying to check out non-existent guest
        showCardAlert('error', 'Guest Not Found', 
            'This card is not associated with any checked-in guest. Please verify the card number.');
    }
}

/**
 * Show card status alert
 */
function showCardAlert(type, title, message) {
    const alertContainer = document.getElementById('cardStatusAlert');
    if (!alertContainer) return;
    
    const iconMap = {
        'warning': 'alert-triangle',
        'error': 'x-circle',
        'success': 'check-circle',
        'info': 'info'
    };
    
    alertContainer.className = `card-status-alert ${type}`;
    alertContainer.innerHTML = `
        <i data-lucide="${iconMap[type]}" class="alert-icon"></i>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
    `;
    alertContainer.style.display = 'flex';
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Prefill guest details from existing data
 */
function prefillGuestDetails(guest) {
    const nameInput = document.getElementById('guestName');
    const companyInput = document.getElementById('guestCompany');
    const purposeInput = document.getElementById('guestPurpose');
    const hostInput = document.getElementById('hostEmployee');
    
    if (nameInput) nameInput.value = guest.name || '';
    if (companyInput) companyInput.value = guest.company || '';
    if (purposeInput) purposeInput.value = guest.purpose || '';
    if (hostInput) hostInput.value = guest.hostEmployee || '';
    
    // Update state
    guestState.guestName = guest.name || '';
    guestState.guestCompany = guest.company || '';
    guestState.guestPurpose = guest.purpose || '';
    guestState.hostEmployee = guest.hostEmployee || '';
    
    // If checking out, also load devices
    if (guestState.currentAction === 'check-out' && guest.devices) {
        guestState.devices = guest.devices.map(d => ({...d}));
        renderDeviceList();
        updateDeviceCount();
    }
}

/**
 * Clear guest details form
 */
function clearGuestDetails() {
    const nameInput = document.getElementById('guestName');
    const companyInput = document.getElementById('guestCompany');
    const purposeInput = document.getElementById('guestPurpose');
    const hostInput = document.getElementById('hostEmployee');
    const notesInput = document.getElementById('guestNotes');
    
    if (nameInput) nameInput.value = '';
    if (companyInput) companyInput.value = '';
    if (purposeInput) purposeInput.value = '';
    if (hostInput) hostInput.value = '';
    if (notesInput) notesInput.value = '';
    
    guestState.guestName = '';
    guestState.guestCompany = '';
    guestState.guestPurpose = '';
    guestState.hostEmployee = '';
    guestState.guestNotes = '';
}

/**
 * Handle guest search
 */
function handleGuestSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!resultsContainer) return;
    
    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    // Search in active guests and history
    const allGuests = [...guestState.activeGuests, ...guestState.guestHistory];
    const results = allGuests.filter(guest => 
        guest.name.toLowerCase().includes(query) ||
        guest.company.toLowerCase().includes(query) ||
        guest.cardNumber.toLowerCase().includes(query) ||
        (guest.hostEmployee && guest.hostEmployee.toLowerCase().includes(query))
    );
    
    // Remove duplicates (prefer active guests)
    const uniqueResults = [];
    const seenCards = new Set();
    
    results.forEach(guest => {
        if (!seenCards.has(guest.cardNumber)) {
            uniqueResults.push(guest);
            seenCards.add(guest.cardNumber);
        }
    });
    
    renderSearchResults(uniqueResults.slice(0, 10)); // Limit to 10 results
}

/**
 * Render search results
 */
function renderSearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No guests found</div>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    resultsContainer.innerHTML = results.map(guest => {
        const isActive = guest.status === 'checked-in';
        const statusClass = isActive ? 'checked-in' : 'checked-out';
        const statusText = isActive ? '🟢 Checked In' : '⚪ Checked Out';
        const itemClass = isActive ? 'search-result-item active-guest' : 'search-result-item';
        
        return `
            <div class="${itemClass}" onclick="selectSearchResult('${guest.cardNumber}')">
                <div class="result-name">${guest.name}</div>
                <div class="result-details">
                    <span>${guest.company}</span>
                    <span>•</span>
                    <span>Card: ${guest.cardNumber}</span>
                    <span>•</span>
                    <span class="result-status ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');
    
    resultsContainer.style.display = 'block';
}

/**
 * Select a search result
 */
function selectSearchResult(cardNumber) {
    const cardInput = document.getElementById('guestCardNumber');
    const searchInput = document.getElementById('guestSearch');
    const resultsContainer = document.getElementById('searchResults');
    
    if (cardInput) {
        cardInput.value = cardNumber;
        guestState.guestCard = cardNumber;
        checkCardStatus(cardNumber);
        cardInput.focus();
    }
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (resultsContainer) {
        resultsContainer.style.display = 'none';
    }
}

/**
 * Debounce function for search
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format time for display
 */
function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Format date for display
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Initialize sample data for testing
 */
function initializeSampleData() {
    // Sample active guests (currently checked in)
    guestState.activeGuests = [
        {
            id: 'guest-001',
            cardNumber: 'TC-1001',
            name: 'John Doe',
            company: 'Acme Corporation',
            purpose: 'meeting',
            hostEmployee: 'Sarah Nakato',
            checkInTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'checked-in',
            devices: [
                { id: 'device_1', deviceTag: 'DT-1001', serialNumber: 'SN-HP-12345', scannedTime: new Date(), scannedTimeFormatted: '10:30:00' }
            ]
        },
        {
            id: 'guest-002',
            cardNumber: 'TC-1002',
            name: 'Jane Smith',
            company: 'Tech Solutions Ltd',
            purpose: 'interview',
            hostEmployee: 'Peter Ssemakula',
            checkInTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            status: 'checked-in',
            devices: []
        }
    ];
    
    // Sample historical guests
    guestState.guestHistory = [
        {
            id: 'guest-003',
            cardNumber: 'TC-1003',
            name: 'Robert Johnson',
            company: 'Global Enterprises',
            purpose: 'delivery',
            hostEmployee: 'Mary Nambi',
            lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            status: 'checked-out'
        }
    ];
    
    console.log('📊 Sample data initialized:', {
        activeGuests: guestState.activeGuests.length,
        historicalGuests: guestState.guestHistory.length
    });
}

/**
 * Handle keydown events on card input (for scanner detection)
 */
function handleCardKeydown(event) {
    // Handle scanner terminators (Enter, Tab)
    if (scannerConfig.terminators.includes(event.keyCode)) {
        event.preventDefault();
        
        const cardNumber = event.target.value.trim();
        if (cardNumber.length >= scannerConfig.minLength) {
            // Focus next input (device scanner)
            const deviceInput = document.getElementById('deviceTagInput');
            if (deviceInput) {
                deviceInput.focus();
            }
        }
    }
}

/**
 * Handle device tag input
 */
function handleDeviceInput(event) {
    const deviceTag = event.target.value.trim();
    
    // Auto-add device when scanner input is detected
    if (deviceTag.length >= scannerConfig.minLength) {
        // Check if this looks like a complete scan (has prefix or sufficient length)
        const hasValidPrefix = scannerConfig.prefixes.some(prefix => 
            deviceTag.toUpperCase().startsWith(prefix));
        
        if (hasValidPrefix || deviceTag.length >= 8) {
            // Small delay to ensure complete scan
            setTimeout(() => {
                if (event.target.value.trim() === deviceTag) {
                    addDeviceToList(deviceTag);
                    event.target.value = ''; // Clear input for next scan
                }
            }, 200);
        }
    }
}

/**
 * Handle keydown events on device input (for scanner detection)
 */
function handleDeviceKeydown(event) {
    // Handle scanner terminators (Enter, Tab)
    if (scannerConfig.terminators.includes(event.keyCode)) {
        event.preventDefault();
        
        const deviceTag = event.target.value.trim();
        if (deviceTag.length >= scannerConfig.minLength) {
            addDeviceToList(deviceTag);
            event.target.value = ''; // Clear input for next scan
        }
    }
}

/**
 * Add a device to the scanned devices list
 */
function addDeviceToList(deviceTag) {
    // Check if device already exists
    const existingDevice = guestState.devices.find(device => 
        device.deviceTag.toUpperCase() === deviceTag.toUpperCase());
    
    if (existingDevice) {
        showTemporaryMessage('Device already scanned!', 'warning');
        return;
    }
    
    // Generate unique ID and serial number
    const deviceId = `device_${++guestState.deviceCounter}`;
    const serialNumber = generateSerialNumber(deviceTag);
    const scannedTime = new Date();
    
    // Add to state
    const newDevice = {
        id: deviceId,
        deviceTag: deviceTag.toUpperCase(),
        serialNumber: serialNumber,
        scannedTime: scannedTime,
        scannedTimeFormatted: formatScanTime(scannedTime)
    };
    
    guestState.devices.push(newDevice);
    
    // Update UI
    renderDeviceList();
    updateDeviceCount();
    
    // Clear validation errors
    clearValidationErrors();
    
    console.log('📱 Device added:', newDevice);
}

/**
 * Generate auto serial number for device
 */
function generateSerialNumber(deviceTag) {
    // Extract device type from tag (e.g., DT-1023 -> DT)
    const parts = deviceTag.split('-');
    const deviceType = parts[0] || 'DEV';
    
    // Generate random serial components
    const brands = ['LEN', 'HP', 'DEL', 'ASU', 'ACE', 'SAM', 'APP'];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const number = Math.floor(Math.random() * 90000) + 10000;
    
    return `SN-${brand}-${number}`;
}

/**
 * Format scan time for display
 */
function formatScanTime(date) {
    const now = new Date();
    const scanTime = new Date(date);
    
    // Format time as HH:MM:SS
    const timeString = scanTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    // Check if it's today
    const isToday = scanTime.toDateString() === now.toDateString();
    
    if (isToday) {
        return timeString;
    } else {
        // Include date if not today
        const dateString = scanTime.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit'
        });
        return `${dateString} ${timeString}`;
    }
}

/**
 * Render the device list table
 */
function renderDeviceList() {
    const tableBody = document.getElementById('deviceTableBody');
    const emptyState = document.getElementById('emptyDeviceState');
    
    if (!tableBody || !emptyState) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (guestState.devices.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Render each device
    guestState.devices.forEach(device => {
        const row = createDeviceRow(device);
        tableBody.appendChild(row);
    });
}

/**
 * Create a device table row
 */
function createDeviceRow(device) {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    row.innerHTML = `
        <td class="device-tag-cell">${device.deviceTag}</td>
        <td>
            <input type="text" class="serial-input" value="${device.serialNumber}" 
                   onchange="updateDeviceSerial('${device.id}', this.value)"
                   placeholder="Enter serial number">
        </td>
        <td class="scan-time-cell">
            <div class="time-display">
                <i data-lucide="clock" class="time-icon"></i>
                <span class="time-text">${device.scannedTimeFormatted}</span>
            </div>
        </td>
        <td>
            <button class="remove-device-btn" onclick="removeDevice('${device.id}')" 
                    title="Remove device">
                <i data-lucide="x" class="remove-icon"></i>
                ❌
            </button>
        </td>
    `;
    
    // Initialize Lucide icons for the new row
    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 0);
    
    return row;
}

/**
 * Update device serial number
 */
function updateDeviceSerial(deviceId, newSerial) {
    const device = guestState.devices.find(d => d.id === deviceId);
    if (device) {
        device.serialNumber = newSerial.trim();
        console.log('📝 Serial updated:', device);
    }
}

/**
 * Remove device from list
 */
function removeDevice(deviceId) {
    guestState.devices = guestState.devices.filter(d => d.id !== deviceId);
    renderDeviceList();
    updateDeviceCount();
    console.log('🗑️ Device removed:', deviceId);
}

/**
 * Update device count display
 */
function updateDeviceCount() {
    const countElement = document.getElementById('deviceCount');
    if (countElement) {
        const count = guestState.devices.length;
        countElement.textContent = `${count} device${count !== 1 ? 's' : ''}`;
    }
}

/**
 * Handle action toggle (Check-In / Check-Out)
 */
function handleActionToggle(action) {
    updateActionState(action);
}

/**
 * Update the action state and UI
 */
function updateActionState(action) {
    guestState.currentAction = action;
    
    const checkInBtn = document.getElementById('checkInBtn');
    const checkOutBtn = document.getElementById('checkOutBtn');
    const actionStatus = document.getElementById('actionStatus');
    
    // Update button states
    if (checkInBtn && checkOutBtn) {
        checkInBtn.classList.toggle('active', action === 'check-in');
        checkOutBtn.classList.toggle('active', action === 'check-out');
    }
    
    // Update status text
    if (actionStatus) {
        const statusText = actionStatus.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = `Mode: Guest ${action === 'check-in' ? 'Check-In' : 'Check-Out'}`;
        }
    }
    
    // Update page styling for mode (visual indication)
    document.body.classList.remove('checkin-mode', 'checkout-mode');
    if (action === 'check-in') {
        document.body.classList.add('checkin-mode');
    } else {
        document.body.classList.add('checkout-mode');
    }
    
    console.log('🔄 Action mode:', action);
}

/**
 * Handle guest processing
 */
function handleProcessGuest() {
    if (guestState.isProcessing) return;
    
    // Validate input
    const validation = validateGuestInput();
    if (!validation.isValid) {
        showValidationErrors(validation.errors);
        return;
    }
    
    // Clear any existing errors
    clearValidationErrors();
    
    // Start processing
    guestState.isProcessing = true;
    const processBtn = document.getElementById('processGuestBtn');
    if (processBtn) {
        processBtn.disabled = true;
        processBtn.innerHTML = '<i data-lucide="loader" class="process-icon"></i><span>Processing...</span>';
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Simulate processing delay
    setTimeout(() => {
        processGuestTransaction();
    }, 1500);
}

/**
 * Validate guest input before processing
 */
function validateGuestInput() {
    const errors = [];
    
    // Check guest card
    if (!guestState.guestCard || guestState.guestCard.length < 3) {
        errors.push('Guest card number is required');
    }
    
    // For check-in, validate guest details
    if (guestState.currentAction === 'check-in') {
        if (!guestState.guestName || guestState.guestName.length < 2) {
            errors.push('Guest name is required');
        }
        
        if (!guestState.guestCompany || guestState.guestCompany.length < 2) {
            errors.push('Company/Organization is required');
        }
        
        if (!guestState.guestPurpose) {
            errors.push('Purpose of visit is required');
        }
        
        if (!guestState.hostEmployee || guestState.hostEmployee.length < 2) {
            errors.push('Host employee name is required');
        }
        
        // Check devices (at least one required for check-in)
        if (guestState.devices.length === 0) {
            errors.push('At least one device must be scanned for check-in');
        }
    }
    
    // For check-out, validate that guest exists
    if (guestState.currentAction === 'check-out') {
        const activeGuest = guestState.activeGuests.find(g => 
            g.cardNumber.toUpperCase() === guestState.guestCard.toUpperCase() && 
            g.status === 'checked-in'
        );
        
        if (!activeGuest) {
            errors.push('Cannot check out: Guest is not currently checked in');
        }
    }
    
    // Check device serial numbers
    const devicesWithoutSerial = guestState.devices.filter(d => !d.serialNumber.trim());
    if (devicesWithoutSerial.length > 0) {
        errors.push('All devices must have serial numbers');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Process the guest transaction
 */
function processGuestTransaction() {
    const transaction = {
        id: generateTransactionId(),
        timestamp: new Date().toISOString(),
        cardNumber: guestState.guestCard,
        name: guestState.guestName,
        company: guestState.guestCompany,
        purpose: guestState.guestPurpose,
        hostEmployee: guestState.hostEmployee,
        notes: guestState.guestNotes,
        action: guestState.currentAction,
        devices: [...guestState.devices], // Copy devices array
        guardName: document.getElementById('guardName')?.textContent || 'Unknown',
        processed: true
    };
    
    // Update active guests list
    if (guestState.currentAction === 'check-in') {
        // Add to active guests
        const newGuest = {
            ...transaction,
            checkInTime: new Date(),
            status: 'checked-in'
        };
        guestState.activeGuests.push(newGuest);
        
        // Add to history if not already there
        const existsInHistory = guestState.guestHistory.find(g => 
            g.cardNumber === transaction.cardNumber
        );
        if (!existsInHistory) {
            guestState.guestHistory.push({
                ...transaction,
                lastVisit: new Date(),
                status: 'checked-out'
            });
        }
    } else {
        // Check-out: Remove from active guests
        guestState.activeGuests = guestState.activeGuests.filter(g => 
            g.cardNumber.toUpperCase() !== transaction.cardNumber.toUpperCase()
        );
        
        // Update history
        const historyGuest = guestState.guestHistory.find(g => 
            g.cardNumber === transaction.cardNumber
        );
        if (historyGuest) {
            historyGuest.lastVisit = new Date();
            historyGuest.status = 'checked-out';
        }
    }
    
    // Log transaction (in real system, this would save to database)
    console.log('💾 Guest Transaction Processed:', transaction);
    console.log('📊 Active Guests:', guestState.activeGuests.length);
    
    // Show success message
    showSuccessMessage();
    
    // Reset form after short delay
    setTimeout(() => {
        resetGuestForm();
    }, 3000);
}

/**
 * Generate unique transaction ID
 */
function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `guest-${timestamp}-${random}`;
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    
    if (successMessage && successText) {
        const actionText = guestState.currentAction === 'check-in' ? 'Check-In' : 'Check-Out';
        successText.textContent = `✅ Guest ${actionText} Successful`;
        
        successMessage.style.display = 'flex';
        successMessage.classList.add('fade-in');
    }
    
    // Complete processing
    guestState.isProcessing = false;
    const processBtn = document.getElementById('processGuestBtn');
    if (processBtn) {
        processBtn.disabled = false;
        processBtn.innerHTML = '<i data-lucide="save" class="process-icon"></i><span>💾 PROCESS GUEST</span>';
        
        // Reinitialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

/**
 * Reset the guest form
 */
function resetGuestForm() {
    // Clear guest card
    guestState.guestCard = '';
    const cardInput = document.getElementById('guestCardNumber');
    if (cardInput) {
        cardInput.value = '';
    }
    
    // Clear guest details
    clearGuestDetails();
    
    // Clear card status alert
    const alertContainer = document.getElementById('cardStatusAlert');
    if (alertContainer) {
        alertContainer.style.display = 'none';
    }
    
    // Clear devices
    guestState.devices = [];
    renderDeviceList();
    updateDeviceCount();
    
    // Clear device input
    const deviceInput = document.getElementById('deviceTagInput');
    if (deviceInput) {
        deviceInput.value = '';
    }
    
    // Reset to check-in mode
    updateActionState('check-in');
    
    // Hide success message
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'none';
    }
    
    // Clear validation errors
    clearValidationErrors();
    
    // Clear existing guest reference
    guestState.existingGuest = null;
    
    // Focus card input
    if (cardInput) {
        cardInput.focus();
    }
    
    console.log('🔄 Guest form reset');
}

/**
 * Show validation errors
 */
function showValidationErrors(errors) {
    const errorContainer = document.getElementById('validationErrors');
    if (!errorContainer || errors.length === 0) return;
    
    const errorList = errors.map(error => `<li>${error}</li>`).join('');
    errorContainer.innerHTML = `
        <strong>Please fix the following errors:</strong>
        <ul>${errorList}</ul>
    `;
    
    errorContainer.style.display = 'block';
    errorContainer.classList.add('fade-in');
    
    // Scroll to errors
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Clear validation errors
 */
function clearValidationErrors() {
    const errorContainer = document.getElementById('validationErrors');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

/**
 * Show temporary message
 */
function showTemporaryMessage(message, type = 'info') {
    // Create temporary message element
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
        z-index: 1000;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

/**
 * Handle back to main system
 */
function handleBackToMain() {
    // Confirm if there's unsaved data
    if (guestState.guestCard || guestState.devices.length > 0) {
        const confirmed = confirm('You have unsaved data. Are you sure you want to go back to the main system?');
        if (!confirmed) return;
    }
    
    // Navigate back to main system
    window.location.href = 'daily asset register.html';
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Alt + B: Back to main
        if (event.altKey && event.key === 'b') {
            event.preventDefault();
            handleBackToMain();
        }
        
        // Alt + I: Check-In mode
        if (event.altKey && event.key === 'i') {
            event.preventDefault();
            handleActionToggle('check-in');
        }
        
        // Alt + O: Check-Out mode
        if (event.altKey && event.key === 'o') {
            event.preventDefault();
            handleActionToggle('check-out');
        }
        
        // Alt + P: Process guest
        if (event.altKey && event.key === 'p') {
            event.preventDefault();
            handleProcessGuest();
        }
        
        // Escape: Clear current input
        if (event.key === 'Escape') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.classList.contains('scanner-input')) {
                activeElement.value = '';
                activeElement.blur();
            }
        }
    });
}

/**
 * Make functions globally available for HTML onclick handlers
 */
window.updateDeviceSerial = updateDeviceSerial;
window.removeDevice = removeDevice;
window.selectSearchResult = selectSearchResult;