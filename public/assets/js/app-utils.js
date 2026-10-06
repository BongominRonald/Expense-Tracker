/**
 * ========================================
 * REUSABLE UTILITIES & COMPONENTS
 * Student Finance Manager
 * ========================================
 * 
 * This file contains all reusable functions, classes, and utilities
 * to promote code reuse and maintainability.
 * 
 * Features:
 * - Session Management
 * - Cookie Management
 * - API Communication
 * - Form Validation
 * - Alert System
 * - Social Media Integration
 * - Currency Formatting
 * - Date Formatting
 */

(function() {
 'use strict';

// ========================================
// CONSISTENT COLOR SCHEME
// ========================================
const APP_COLORS = {
    primary: '#2563eb',      // Blue - Primary actions
    success: '#10b981',      // Green - Success states
    warning: '#f59e0b',      // Orange - Warning states
    danger: '#ef4444',       // Red - Error/Danger states
    info: '#06b6d4',         // Cyan - Information
    dark: '#1f2937',         // Dark gray - Text
    light: '#f3f4f6',        // Light gray - Backgrounds
    white: '#ffffff',        // White
    gray: '#6b7280',         // Neutral gray (UI text)
    
    // Status colors
    pending: '#f59e0b',      // Orange - Pending status
    active: '#10b981',       // Green - Active status
    completed: '#6366f1',    // Purple - Completed status
    cancelled: '#ef4444',    // Red - Cancelled status
    
    // Financial colors
    surplus: '#10b981',      // Green - Surplus/Profit
    deficit: '#ef4444'       // Red - Deficit/Loss
};

// ========================================
// SESSION MANAGEMENT CLASS
// ========================================
/**
 * Manages user sessions with automatic timeout
 * Stores session data and handles expiration
 */
class SessionManager {
    /**
     * Constructor
     * @param {number} timeoutMinutes - Session timeout in minutes (default: 30)
     */
    constructor(timeoutMinutes = 30) {
        this.timeoutMinutes = timeoutMinutes;
        this.timeoutMilliseconds = timeoutMinutes * 60 * 1000;
        this.sessionKey = 'user_session';
        this.init();
    }

    /**
     * Initialize session management
     * Sets up activity tracking and timeout
     */
    init() {
        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => this.updateActivity(), true);
        });

        // Check if session exists
        this.checkSession();
    }

    /**
     * Update last activity timestamp
     */
    updateActivity() {
        const now = Date.now();
        sessionStorage.setItem('last_activity', now);
        CookieManager.set('last_activity', now, 1); // 1 day expiry
    }

    /**
     * Check if session is valid
     * @returns {boolean} True if session is valid
     */
    checkSession() {
        const lastActivity = sessionStorage.getItem('last_activity');
        if (!lastActivity) {
            return false;
        }

        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceActivity > this.timeoutMilliseconds) {
            this.endSession();
            return false;
        }

        return true;
    }

    /**
     * Start a new session
     * @param {object} userData - User data to store in session
     */
    startSession(userData) {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(userData));
        sessionStorage.setItem('session_start', Date.now());
        this.updateActivity();
        
        // Also store in cookies for persistence
        CookieManager.set('user_id', userData.id, 30);
        CookieManager.set('user_email', userData.email, 30);
    }

    /**
     * Get current session data
     * @returns {object|null} Session data or null if no session
     */
    getSession() {
        const sessionData = sessionStorage.getItem(this.sessionKey);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    /**
     * End current session
     */
    endSession() {
        sessionStorage.clear();
        CookieManager.delete('user_id');
        CookieManager.delete('user_email');
        CookieManager.delete('last_activity');
        if (window.Nav && typeof window.Nav.go === 'function') {
            window.Nav.go('login.html');
        } else {
            window.location.href = '/site1/views/auth/login.html';
        }
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if logged in
     */
    isLoggedIn() {
        try {
            // In local file mode, always allow access to facilitate development/testing
            if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
                return true;
            }
        } catch(_) {}
        return this.getSession() !== null && this.checkSession();
    }
}

// ========================================
// COOKIE MANAGEMENT CLASS
// ========================================
/**
 * Manages browser cookies for persistent data storage
 */
class CookieManager {
    /**
     * Set a cookie
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration in days
     */
    static set(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = `${name}=${value};${expires};path=/`;
    }

    /**
     * Get a cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null if not found
     */
    static get(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length);
            }
        }
        return null;
    }

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     */
    static delete(name) {
        this.set(name, '', -1);
    }

    /**
     * Check if cookie exists
     * @param {string} name - Cookie name
     * @returns {boolean} True if cookie exists
     */
    static exists(name) {
        return this.get(name) !== null;
    }
}

// ========================================
// LOCAL STORAGE MANAGER
// ========================================
/**
 * Manages localStorage with JSON support
 */
class StorageManager {
    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     */
    static userNS() {
        try {
            // Prefer numeric user_id cookie; fallback to email; else 'anon'
            const uid = CookieManager.get('user_id');
            const mail = CookieManager.get('user_email');
            const base = uid ? ('u:' + uid) : (mail ? ('e:' + mail) : 'anon');
            return base + '|';
        } catch(_) { return 'anon|'; }
    }

    static withNS(key) {
        const ns = this.userNS();
        return ns + String(key);
    }

    static set(key, value) {
        try {
            localStorage.setItem(this.withNS(key), JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            // Rethrow so callers can surface quota/full errors to users
            throw error;
        }
    }

    /**
     * Get data from localStorage
     * @param {string} key - Storage key
     * @returns {any} Parsed value or null if not found
     */
    static get(key) {
        try {
            const item = localStorage.getItem(this.withNS(key));
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    static remove(key) {
        localStorage.removeItem(this.withNS(key));
    }

    /**
     * Clear all localStorage
     */
    static clear() {
        // Only clear keys belonging to this user namespace to avoid removing others
        try {
            const ns = this.userNS();
            const toRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(ns)) toRemove.push(k);
            }
            toRemove.forEach(k => localStorage.removeItem(k));
        } catch(_) {
            // Fallback if iteration fails
            localStorage.clear();
        }
    }
}

// ========================================
// CURRENCY FORMATTER
// ========================================
/**
 * Format numbers as currency
 */
class CurrencyFormatter {
    /**
     * Format amount as UGX currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    static format(amount) {
        if (isNaN(amount)) return 'UGX 0';
        return 'UGX ' + new Intl.NumberFormat('en-UG').format(amount);
    }

    /**
     * Parse currency string to number
     * @param {string} currencyString - Currency string (e.g., "UGX 50,000")
     * @returns {number} Parsed number
     */
    static parse(currencyString) {
        return parseFloat(currencyString.replace(/[^0-9.-]+/g, '')) || 0;
    }
}

// ========================================
// DATE FORMATTER
// ========================================
/**
 * Format dates consistently
 */
class DateFormatter {
    /**
     * Format date as readable string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date string
     */
    static format(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    /**
     * Get current date in YYYY-MM-DD format
     * @returns {string} Current date
     */
    static today() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Calculate days between two dates
     * @param {string|Date} date1 - First date
     * @param {string|Date} date2 - Second date
     * @returns {number} Number of days
     */
    static daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

// ========================================
// ALERT SYSTEM
// ========================================
/**
 * Display beautiful modal alerts
 */
class AlertSystem {
    /**
     * Show alert modal
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, error, warning, info)
     */
    static show(message, type = 'info') {
        // Remove existing alert
        const existing = document.getElementById('alertModal');
        if (existing) existing.remove();

        // Icon and color configuration
        const config = {
            success: { icon: 'fa-check-circle', color: APP_COLORS.success },
            error: { icon: 'fa-times-circle', color: APP_COLORS.danger },
            warning: { icon: 'fa-exclamation-triangle', color: APP_COLORS.warning },
            info: { icon: 'fa-info-circle', color: APP_COLORS.info }
        };

        const settings = config[type] || config.info;

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'alertModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 10000; animation: fadeIn 0.3s;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 15px; 
                        max-width: 400px; width: 90%; text-align: center; 
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);">
                <i class="fas ${settings.icon}" style="font-size: 60px; color: ${settings.color};"></i>
                <h3 style="margin: 20px 0 15px; color: ${APP_COLORS.dark}; font-size: 24px;">
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </h3>
                <p style="color: ${APP_COLORS.dark}; margin-bottom: 25px;">${message}</p>
                <button onclick="this.closest('#alertModal').remove()" 
                        style="background: ${settings.color}; color: white; border: none;
                               padding: 12px 30px; border-radius: 8px; cursor: pointer;
                               font-size: 16px; font-weight: 600;">OK</button>
            </div>
        `;

        document.body.appendChild(modal);

        // Auto-close after 5 seconds
        setTimeout(() => modal.remove(), 5000);
    }

    static success(message) { this.show(message, 'success'); }
    static error(message) { this.show(message, 'error'); }
    static warning(message) { this.show(message, 'warning'); }
    static info(message) { this.show(message, 'info'); }
}

// ========================================
// SOCIAL MEDIA INTEGRATION
// ========================================
/**
 * Share content via social media
 */
class SocialShare {
    /**
     * Share via WhatsApp
     * @param {string} message - Message to share
     * @param {string} phone - Phone number (optional)
     */
    static whatsapp(message, phone = '') {
        const encodedMessage = encodeURIComponent(message);
        const url = phone 
            ? `https://wa.me/${phone}?text=${encodedMessage}`
            : `https://wa.me/?text=${encodedMessage}`;
        window.open(url, '_blank');
    }

    /**
     * Share via Email
     * @param {string} to - Recipient email
     * @param {string} subject - Email subject
     * @param {string} body - Email body
     */
    static email(to, subject, body) {
        const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    }

    /**
     * Share financial report via WhatsApp
     * @param {object} reportData - Report data object
     */
    static shareReport(reportData) {
        const message = `
📊 *Financial Report*
━━━━━━━━━━━━━━━━
💰 Total Income: ${CurrencyFormatter.format(reportData.income)}
💸 Total Expenses: ${CurrencyFormatter.format(reportData.expenses)}
📈 Balance: ${CurrencyFormatter.format(reportData.balance)}
${reportData.balance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}

Generated by Student Finance Manager
        `.trim();
        
        this.whatsapp(message);
    }
}

// ========================================
// FORM VALIDATOR
// ========================================
/**
 * Validate form inputs
 */
class FormValidator {
    /**
     * Validate required fields
     * @param {HTMLFormElement} form - Form element
     * @returns {boolean} True if valid
     */
    static validateRequired(form) {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else {
                this.clearError(input);
            }
        });

        return isValid;
    }

    /**
     * Show error message for input
     * @param {HTMLElement} input - Input element
     * @param {string} message - Error message
     */
    static showError(input, message) {
        this.clearError(input);
        input.style.borderColor = APP_COLORS.danger;
        
        const error = document.createElement('div');
        error.className = 'error-message';
        error.style.color = APP_COLORS.danger;
        error.style.fontSize = '0.875rem';
        error.style.marginTop = '0.25rem';
        error.textContent = message;
        
        input.parentElement.appendChild(error);
    }

    /**
     * Clear error message
     * @param {HTMLElement} input - Input element
     */
    static clearError(input) {
        input.style.borderColor = '';
        const error = input.parentElement.querySelector('.error-message');
        if (error) error.remove();
    }
}

// ========================================
// EXPORT ALL UTILITIES
// ========================================
window.AppUtils = {
    SessionManager,
    CookieManager,
    StorageManager,
    CurrencyFormatter,
    DateFormatter,
    AlertSystem,
    SocialShare,
    FormValidator,
    APP_COLORS
};

console.log('✅ App Utilities Loaded Successfully');

})();

// Disable browser autocomplete and hints globally for security
try {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      document.querySelectorAll('form').forEach(f => { f.setAttribute('autocomplete','off'); });
      document.querySelectorAll('input, textarea, select').forEach(el => {
        el.setAttribute('autocomplete','off');
        el.setAttribute('autocapitalize','off');
        el.setAttribute('autocorrect','off');
        el.setAttribute('spellcheck','false');
      });
      // Aggressive suppression for sensitive fields
      const sensitive = document.querySelectorAll('input[type="email"], input[type="password"], input[name*="email" i], input[name*="user" i]');
      sensitive.forEach(el => {
        try {
          el.setAttribute('autocomplete','off');
          // Non-standard but commonly honored by browsers/extensions
          el.setAttribute('autoComplete','off');
          el.setAttribute('autofill','off');
          el.setAttribute('data-no-autofill','1');
          // Rename name attribute to reduce autofill heuristics (ids are used in JS)
          const origName = el.getAttribute('name');
          if (origName && !/no_autofill$/i.test(origName)) {
            el.setAttribute('name', origName + '_no_autofill');
          }
          // Readonly until focus to deter autofill popups
          if (!el.hasAttribute('readonly')) {
            el.setAttribute('readonly','readonly');
            el.addEventListener('focus', function onFocus(){
              try { el.removeAttribute('readonly'); } catch(_) {}
              el.removeEventListener('focus', onFocus);
            }, { once: true });
          }
        } catch(_) {}
      });
    } catch(_) {}
  });
} catch(_) {}
