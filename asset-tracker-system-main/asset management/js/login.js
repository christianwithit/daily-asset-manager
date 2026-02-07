/**
 * Login Page JavaScript
 * Vision Group Uganda - Change Management System
 * Handles login form validation, password visibility toggle, and authentication
 */

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
        // Redirect to daily asset register if already logged in
        window.location.href = 'daily asset register.html';
        return;
    }
    
    initializeLoginPage();
});

/**
 * Initialize all login page functionality
 */
function initializeLoginPage() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    const entranceSelect = document.getElementById('entrance');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Password visibility toggle
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, togglePasswordBtn);
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(usernameInput, passwordInput, entranceSelect, errorMessage, errorText);
        });
    }

    // Clear error on input
    [usernameInput, passwordInput, entranceSelect].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                hideError(errorMessage);
            });
        }
    });

    // Auto-focus username field
    if (usernameInput) {
        usernameInput.focus();
    }
}

/**
 * Toggle password visibility
 * @param {HTMLInputElement} passwordInput - Password input field
 * @param {HTMLButtonElement} toggleBtn - Toggle button
 */
function togglePasswordVisibility(passwordInput, toggleBtn) {
    const isPassword = passwordInput.type === 'password';
    
    // Toggle input type
    passwordInput.type = isPassword ? 'text' : 'password';
    
    // Update icon
    const icon = toggleBtn.querySelector('[data-lucide]');
    if (icon) {
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Update aria-label
    toggleBtn.setAttribute('aria-label', 
        isPassword ? 'Hide password' : 'Show password'
    );
}

/**
 * Handle login form submission
 * @param {HTMLInputElement} usernameInput - Username input field
 * @param {HTMLInputElement} passwordInput - Password input field
 * @param {HTMLSelectElement} entranceSelect - Entrance dropdown
 * @param {HTMLElement} errorMessage - Error message container
 * @param {HTMLElement} errorText - Error text element
 */
function handleLogin(usernameInput, passwordInput, entranceSelect, errorMessage, errorText) {
    // Get values
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const entrance = entranceSelect.value;

    // Validate inputs
    if (!username) {
        showError(errorMessage, errorText, 'Please enter your username');
        usernameInput.focus();
        return;
    }

    if (!password) {
        showError(errorMessage, errorText, 'Please enter your password');
        passwordInput.focus();
        return;
    }

    if (!entrance) {
        showError(errorMessage, errorText, 'Please select an entrance point');
        entranceSelect.focus();
        return;
    }

    // Show loading state
    const loginBtn = document.querySelector('.login-btn');
    const originalBtnText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<i data-lucide="loader-2" class="login-icon animate-spin"></i> Authenticating...';
    loginBtn.disabled = true;
    
    // Reinitialize icons for loader
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Simulate authentication (replace with actual API call)
    setTimeout(() => {
        // Demo credentials - replace with actual authentication
        if (username === 'admin' && password === 'admin') {
            // Store session data
            sessionStorage.setItem('isAuthenticated', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('entrance', entrance);
            sessionStorage.setItem('loginTime', new Date().toISOString());

            // Show success and redirect
            showSuccess(loginBtn);
            setTimeout(() => {
                window.location.href = 'daily asset register.html';
            }, 1000);
        } else {
            // Show error
            loginBtn.innerHTML = originalBtnText;
            loginBtn.disabled = false;
            showError(errorMessage, errorText, 'Invalid username or password. Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
            
            // Reinitialize icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }, 1500);
}

/**
 * Show error message
 * @param {HTMLElement} errorMessage - Error message container
 * @param {HTMLElement} errorText - Error text element
 * @param {string} message - Error message to display
 */
function showError(errorMessage, errorText, message) {
    if (errorMessage && errorText) {
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        // Announce to screen readers
        errorMessage.setAttribute('role', 'alert');
        errorMessage.setAttribute('aria-live', 'assertive');
    }
}

/**
 * Hide error message
 * @param {HTMLElement} errorMessage - Error message container
 */
function hideError(errorMessage) {
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

/**
 * Show success state on login button
 * @param {HTMLButtonElement} loginBtn - Login button
 */
function showSuccess(loginBtn) {
    loginBtn.innerHTML = '<i data-lucide="check-circle" class="login-icon"></i> Success!';
    loginBtn.style.backgroundColor = '#28A745';
    
    // Reinitialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Add spinning animation for loader icon
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
