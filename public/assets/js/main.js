/**
 * Main JavaScript - Utilities and Helper Functions (OOP)
 */

// API Class (OOP)
class API {
    constructor(baseURL = null) {
        // Priority: explicit global override -> explicit constructor arg -> auto-detect
        if (window.API_BASE) {
            // Allow either with or without trailing slash
            this.baseURL = window.API_BASE.endsWith('/') ? window.API_BASE : window.API_BASE + '/';
            console.log('API Base URL (global override):', this.baseURL);
            return;
        }

        if (baseURL) {
            this.baseURL = baseURL.endsWith('/') ? baseURL : baseURL + '/';
        } else {
            // Auto-detect the correct base URL (relative to current directory)
            const path = window.location.pathname;
            const directory = path.substring(0, path.lastIndexOf('/'));
            this.baseURL = window.location.origin + directory + '/backend/';
        }

        console.log('API Base URL:', this.baseURL);
    }
    
    async request(endpoint, method = 'GET', data = null) {
        const url = this.baseURL + endpoint;
        console.log(`API Request: ${method} ${url}`);
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Only include credentials for same-origin requests
        try {
            const requestURL = new URL(url);
            const sameOrigin = (window.location.protocol !== 'file:') && (requestURL.origin === window.location.origin);
            if (sameOrigin) {
                options.credentials = 'include';
            } else {
                options.credentials = 'omit';
            }
        } catch (_) {
            // If URL parsing fails, omit credentials as a safe default
            options.credentials = 'omit';
        }
        
        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
            console.log('Request Data:', data);
        }
        
        try {
            const response = await fetch(url, options);
            console.log('Response Status:', response.status);
            
            // If not OK, surface body text for debugging
            if (!response.ok) {
                console.error('HTTP Error:', response.status, response.statusText);
                const text = await response.text().catch(() => '');
                console.error('Response Text:', text);
                return { success: false, status: response.status, message: text || `Server error: ${response.status}` };
            }

            // Try to detect JSON content-type before parsing
            const ctype = (response.headers.get('content-type') || '').toLowerCase();
            if (ctype.includes('application/json')) {
                const result = await response.json();
                console.log('Response Data:', result);
                return result;
            } else {
                const text = await response.text();
                console.warn('Non-JSON response received:', ctype, text);
                return { success: false, message: text || 'Server returned non-JSON response' };
            }
        } catch (error) {
            console.error('API Error:', error);
            console.error('Full URL was:', url);
            return { success: false, message: `Network error: Cannot connect to server. Tried ${url}. Check if WAMP/Apache and MySQL are running, and API base is configured.` };
        }
    }

    // Allow runtime change of base URL
    setBaseURL(url) {
        this.baseURL = url.endsWith('/') ? url : url + '/';
        console.log('API Base URL set to:', this.baseURL);
    }
    
    get(endpoint) {
        return this.request(endpoint, 'GET');
    }
    
    post(endpoint, data) {
        return this.request(endpoint, 'POST', data);
    }
    
    put(endpoint, data) {
        return this.request(endpoint, 'PUT', data);
    }
    
    delete(endpoint) {
        return this.request(endpoint, 'DELETE');
    }
}

// Alert Class (OOP) - Enhanced with Modal Popup
class Alert {
    static show(message, type = 'success') {
        // Remove any existing alert modal
        const existingModal = document.getElementById('alertModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Icon and color based on type
        const icons = {
            success: { icon: 'fa-check-circle', color: '#10b981' },
            error: { icon: 'fa-times-circle', color: '#ef4444' },
            warning: { icon: 'fa-exclamation-triangle', color: '#f59e0b' },
            info: { icon: 'fa-info-circle', color: '#3b82f6' }
        };
        
        const config = icons[type] || icons.info;
        
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'alertModal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            width: 90%;
            text-align: center;
            animation: slideIn 0.3s ease;
            position: relative;
        `;
        
        modalContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <i class="fas ${config.icon}" style="font-size: 60px; color: ${config.color};"></i>
            </div>
            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                ${type.charAt(0).toUpperCase() + type.slice(1)}!
            </h3>
            <p style="margin: 0 0 25px 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                ${message}
            </p>
            <button id="alertModalBtn" style="
                background: ${config.color};
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            ">
                OK
            </button>
        `;
        
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        
        // Add animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #alertModalBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            }
        `;
        document.head.appendChild(style);
        
        // Close modal on button click
        const closeModal = () => {
            modalOverlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modalOverlay.remove();
                style.remove();
            }, 300);
        };
        
        document.getElementById('alertModalBtn').addEventListener('click', closeModal);
        
        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Auto close after 5 seconds
        setTimeout(closeModal, 5000);
    }
    
    static success(message) {
        this.show(message, 'success');
    }
    
    static error(message) {
        this.show(message, 'error');
    }
    
    static warning(message) {
        this.show(message, 'warning');
    }
    
    static info(message) {
        this.show(message, 'info');
    }
}

// Modal Class (OOP)
class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
    }
    
    show() {
        if (this.modal) {
            this.modal.classList.add('show');
        }
    }
    
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }
    
    toggle() {
        if (this.modal) {
            this.modal.classList.toggle('show');
        }
    }
}

// Form Validator Class (OOP)
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
    }
    
    validate() {
        if (!this.form) return false;
        
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
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
    
    showError(input, message) {
        this.clearError(input);
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-danger';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    }
    
    clearError(input) {
        input.classList.remove('error');
        const errorDiv = input.parentElement.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

// Storage Class (OOP)
class Storage {
    static userNS() {
        try {
            const cookies = document.cookie || '';
            const getCookie = (name) => {
                const m = cookies.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
                return m ? decodeURIComponent(m[1]) : null;
            };
            const uid = getCookie('user_id');
            const mail = getCookie('user_email');
            const base = uid ? ('u:' + uid) : (mail ? ('e:' + mail) : 'anon');
            return base + '|';
        } catch(_) { return 'anon|'; }
    }
    static withNS(key) {
        return this.userNS() + String(key);
    }
    static set(key, value) {
        localStorage.setItem(this.withNS(key), JSON.stringify(value));
    }
    static get(key) {
        const item = localStorage.getItem(this.withNS(key));
        return item ? JSON.parse(item) : null;
    }
    static remove(key) {
        localStorage.removeItem(this.withNS(key));
    }
    static clear() {
        try {
            const ns = this.userNS();
            const toRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(ns)) toRemove.push(k);
            }
            toRemove.forEach(k => localStorage.removeItem(k));
        } catch(_) {
            localStorage.clear();
        }
    }
}

// Cookie Class (OOP)
class Cookie {
    static set(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }
    
    static get(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    
    static delete(name) {
        this.set(name, '', -1);
    }
}

// Session Timeout Manager Class (OOP)
class SessionManager {
    constructor(timeoutMinutes = 30) {
        this.timeoutMinutes = timeoutMinutes;
        this.timeoutMilliseconds = timeoutMinutes * 60 * 1000;
        this.timeoutId = null;
        this.warningTimeoutId = null;
        this.lastActivity = Date.now();
        
        // Save session start time in cookie
        if (!Cookie.get('session_start')) {
            Cookie.set('session_start', Date.now(), 1);
        }
        
        this.init();
    }
    
    init() {
        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, () => this.resetTimer(), true);
        });
        
        // Start the timeout timer
        this.resetTimer();
        
        // Check session on page load
        this.checkSession();
    }
    
    resetTimer() {
        this.lastActivity = Date.now();
        Cookie.set('last_activity', this.lastActivity, 1);
        
        // Clear existing timers
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
        
        // Show warning 2 minutes before timeout
        const warningTime = this.timeoutMilliseconds - (2 * 60 * 1000);
        this.warningTimeoutId = setTimeout(() => this.showWarning(), warningTime);
        
        // Set timeout
        this.timeoutId = setTimeout(() => this.logout(), this.timeoutMilliseconds);
    }
    
    showWarning() {
        Alert.warning('Your session will expire in 2 minutes due to inactivity. Move your mouse to stay logged in.');
    }
    
    checkSession() {
        const lastActivity = Cookie.get('last_activity');
        if (lastActivity) {
            const timeSinceActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceActivity > this.timeoutMilliseconds) {
                this.logout();
            }
        }
    }
    
    logout() {
        Alert.error('Your session has expired due to inactivity. Please login again.');
        setTimeout(() => {
            // Clear all storage
            Storage.clear();
            Cookie.delete('session_start');
            Cookie.delete('last_activity');
            Cookie.delete('user_email');
            
            // Redirect to login (HTML UI) via Nav mapping
            if (window.Nav && typeof window.Nav.go === 'function') {
                window.Nav.go('login.html');
            } else {
                // Fallback: derive current directory and navigate relative to it
                try {
                    const origin = window.location.origin;
                    const path = window.location.pathname;
                    const directory = path.substring(0, path.lastIndexOf('/'));
                    window.location.href = origin + directory + '/views/auth/login.html';
                } catch (_) {
                    // Last resort: navigate to relative path
                    window.location.href = 'views/auth/login.html';
                }
            }
        }, 2000);
    }
    
    destroy() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId);
    }
}

// Utility Functions
const Utils = {
    formatCurrency(amount) {
        return 'UGX ' + new Intl.NumberFormat().format(amount);
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },
    
    debounce(func, wait) {
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
};

// Export for use in other files
window.API = API;
window.Alert = Alert;
window.Modal = Modal;
window.FormValidator = FormValidator;
window.Storage = Storage;
window.Cookie = Cookie;
window.SessionManager = SessionManager;
window.Utils = Utils;

// Navigation helper: MVC structure aware
window.Nav = {
    go(page) {
        const isFile = window.location.protocol === 'file:';
        // Compute site root dynamically for HTTP (e.g., /site1) and FILE (e.g., /D:/.../site1)
        const p = window.location.pathname;
        // Derive directory portion of the current path (everything before the final '/')
        // For HTTP served files this gives '' for root pages like '/index.html' (so httpRoot becomes '')
        // For file protocol this gives the full folder path e.g. '/D:/XAM/htdocs/site1'
        const dir = p.substring(0, p.lastIndexOf('/')) || '';
        let httpRoot = '';
        let fileRoot = '';

        // If the project folder name (site1) appears in the path, prefer using that as the root
        const siteMatch = p.toLowerCase().indexOf('/site1');
        if (siteMatch >= 0) {
            fileRoot = p.substring(0, siteMatch + '/site1'.length);
            httpRoot = '/site1';
        } else {
            // Use the directory portion as the HTTP root (empty when at '/index.html')
            httpRoot = dir || '';
            fileRoot = dir || p;
        }

        const mapHttp = {
            'login.html': `${httpRoot}/views/auth/login.html`,
            'register.html': `${httpRoot}/views/auth/register.html`,
            'goals-workflow.html': `${httpRoot}/views/workflow/goals.html`,
            'budget-workflow.html': `${httpRoot}/views/workflow/budget.html`,
            'expenditure-workflow.html': `${httpRoot}/views/workflow/expenditure.html`,
            'dashboard_enhanced.html': `${httpRoot}/views/dashboard/dashboard.html`,
            'profile.html': `${httpRoot}/views/profile/profile.html`,
            'reports.html': `${httpRoot}/views/reports/reports.html`,
            'activity.html': `${httpRoot}/views/reports/activity.html`,
            'settings.html': `${httpRoot}/views/settings/settings.html`,
            'sms-parser.html': `${httpRoot}/views/sms/sms-parser.html`,
            'index.html': `${httpRoot}/index.html`
        };
        const mapFile = {
            'login.html': `${fileRoot}/views/auth/login.html`,
            'register.html': `${fileRoot}/views/auth/register.html`,
            'goals-workflow.html': `${fileRoot}/views/workflow/goals.html`,
            'budget-workflow.html': `${fileRoot}/views/workflow/budget.html`,
            'expenditure-workflow.html': `${fileRoot}/views/workflow/expenditure.html`,
            'dashboard_enhanced.html': `${fileRoot}/views/dashboard/dashboard.html`,
            'profile.html': `${fileRoot}/views/profile/profile.html`,
            'reports.html': `${fileRoot}/views/reports/reports.html`,
            'activity.html': `${fileRoot}/views/reports/activity.html`,
            'settings.html': `${fileRoot}/views/settings/settings.html`,
            'sms-parser.html': `${fileRoot}/views/sms/sms-parser.html`,
            'index.html': `${fileRoot}/index.html`
        };

        const path = isFile ? (mapFile[page] || `${fileRoot}/${page}`) : (mapHttp[page] || `${httpRoot}/${page}`);

        let targetUrl;
        if (isFile) {
            // Ensure a proper file:// URL when opened directly from the filesystem
            // path is expected to start with a leading slash (e.g. '/D:/.../site1/views/...')
            targetUrl = path.startsWith('file://') ? path : ('file://' + path);
        } else {
            // For HTTP(S) served pages, build a proper absolute URL from the origin
            targetUrl = window.location.origin + path;
        }

        console.log('🔄 Navigating to:', targetUrl);
        window.location.href = targetUrl;
    }
};

// Sidebar functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const mainContent = document.querySelector('.main-content');
    
    // Load saved sidebar state from localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed && sidebar) {
        sidebar.classList.add('collapsed');
    }
    
    // Sidebar collapse/expand button
    if (sidebarCollapseBtn && sidebar) {
        sidebarCollapseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            
            // Save state to localStorage
            const isCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Update icon
            const icon = this.querySelector('i');
            if (icon) {
                if (isCollapsed) {
                    icon.className = 'fas fa-chevron-right';
                } else {
                    icon.className = 'fas fa-bars';
                }
            }
        });
    }
    
    // Mobile toggle button
    if (mobileToggle && sidebar) {
        // Skip global handler if page uses inline control
        if (!mobileToggle.hasAttribute('data-inline-control')) {
            mobileToggle.addEventListener('click', function() {
                sidebar.classList.toggle('show');
            });
        }
    }
    
    // Sidebar close button (mobile)
    if (sidebarToggle && sidebar) {
        // Skip global handler if page uses inline control
        if (!sidebarToggle.hasAttribute('data-inline-control')) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.remove('show');
            });
        }
    }
    
    // Dropdown toggles (skip if ARIA-based handlers are present on the page)
    const hasAriaMenus = Array.from(document.querySelectorAll('.dropdown-toggle')).some(el => el.hasAttribute('aria-controls'));
    if (!hasAriaMenus) {
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Don't toggle dropdown if sidebar is collapsed
                if (sidebar && sidebar.classList.contains('collapsed')) {
                    return;
                }
                
                // Get the submenu
                const submenu = this.nextElementSibling;
                const arrow = this.querySelector('.dropdown-arrow');
                
                if (submenu && submenu.classList.contains('sidebar-submenu')) {
                    // Toggle submenu
                    submenu.classList.toggle('show');
                    
                    // Rotate arrow
                    if (arrow) {
                        arrow.classList.toggle('rotate');
                    }
                }
            });
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            if (sidebar && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.remove('show');
        }
    });

    // Accessibility Manager: apply saved accessibility preferences app-wide
    try {
        if (!window.Accessibility) {
            window.Accessibility = {
                ensureStyles() {
                    if (document.getElementById('a11yStyles')) return;
                    const style = document.createElement('style');
                    style.id = 'a11yStyles';
                    style.textContent = `
                      :root { --base-font-size: 100%; }
                      html { font-size: var(--base-font-size); }
                      [data-theme="dark"] body { background:#0f172a; color:#e5e7eb; }
                      [data-theme="dark"] .card { background:#0b1220; color:#e5e7eb; }
                      [data-theme="dark"] .site-footer { background:#0b1220 !important; color:#e5e7eb !important; }
                      .high-contrast body { background:#000 !important; color:#fff !important; }
                      .high-contrast a { color:#0ff !important; text-decoration: underline; }
                      .colorblind-friendly { filter: saturate(0.9) hue-rotate(5deg); }
                      .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after { animation: none !important; transition: none !important; }
                    `;
                    document.head.appendChild(style);
                },
                apply() {
                    this.ensureStyles();
                    let a11y = {};
                    try { a11y = JSON.parse(localStorage.getItem('settings_accessibility')||'{}'); } catch(_) {}
                    const root = document.documentElement;
                    // Theme
                    const theme = (a11y.colorTheme || 'light');
                    root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
                    // High contrast
                    root.classList.toggle('high-contrast', a11y.colorTheme === 'high-contrast');
                    // Colorblind
                    root.classList.toggle('colorblind-friendly', a11y.colorTheme === 'colorblind');
                    // Font size
                    const fs = a11y.fontSize || 'medium';
                    const map = { small: '90%', medium: '100%', large: '112%', xlarge: '125%' };
                    root.style.setProperty('--base-font-size', map[fs] || '100%');
                    // Reduced motion
                    root.classList.toggle('reduce-motion', !!a11y.reduceMotion);
                }
            };
        }
        // Apply on load
        window.Accessibility.apply();
    } catch(_) {}

    // Static footer styling - no dynamic animations

});
