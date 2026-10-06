/**
 * iOS Mode Enhancement
 * Adds iOS-style interface elements for mobile app experience
 */

class iOSMode {
    constructor() {
        this.enabled = false;
        this.statusBarElement = null;
        this.tabBarElement = null;
    }

    init() {
        // Only enable on mobile devices
        if (this.isMobile()) {
            this.createStatusBar();
            this.createTabBar();
            this.enableiOSMode();
            this.updateTime();
            setInterval(() => this.updateTime(), 1000);
        }
    }

    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createStatusBar() {
        if (document.querySelector('.ios-status-bar')) return;

        this.statusBarElement = document.createElement('div');
        this.statusBarElement.className = 'ios-status-bar';
        this.statusBarElement.innerHTML = `
            <div class="time">9:41</div>
            <div class="indicators">
                <i class="fas fa-signal" style="font-size: 12px;"></i>
                <i class="fas fa-wifi" style="font-size: 12px;"></i>
                <div class="battery">
                    <div class="battery-fill"></div>
                </div>
            </div>
        `;
        
        document.body.insertBefore(this.statusBarElement, document.body.firstChild);
    }

    createTabBar() {
        if (document.querySelector('.ios-tab-bar')) return;

        // Only show tab bar on dashboard and main pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('/auth/') || currentPath.includes('index.html')) return;

        this.tabBarElement = document.createElement('div');
        this.tabBarElement.className = 'ios-tab-bar';
        this.tabBarElement.innerHTML = `
            <a href="#" onclick="Nav.go('dashboard_enhanced.html')" class="tab-item ${currentPath.includes('dashboard') ? 'active' : ''}">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </a>
            <a href="#" onclick="Nav.go('budget-workflow.html')" class="tab-item ${currentPath.includes('budget') ? 'active' : ''}">
                <i class="fas fa-calculator"></i>
                <span>Budget</span>
            </a>
            <a href="#" onclick="Nav.go('expenditure-workflow.html')" class="tab-item ${currentPath.includes('expenditure') ? 'active' : ''}">
                <i class="fas fa-shopping-cart"></i>
                <span>Expenses</span>
            </a>
            <a href="#" onclick="Nav.go('reports.html')" class="tab-item ${currentPath.includes('reports') ? 'active' : ''}">
                <i class="fas fa-chart-bar"></i>
                <span>Reports</span>
            </a>
            <a href="#" onclick="Nav.go('profile.html')" class="tab-item ${currentPath.includes('profile') ? 'active' : ''}">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </a>
        `;
        
        document.body.appendChild(this.tabBarElement);
    }

    enableiOSMode() {
        document.body.classList.add('ios-mode');
        this.enabled = true;
    }

    disableiOSMode() {
        document.body.classList.remove('ios-mode');
        if (this.statusBarElement) this.statusBarElement.remove();
        if (this.tabBarElement) this.tabBarElement.remove();
        this.enabled = false;
    }

    updateTime() {
        if (!this.statusBarElement) return;
        
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
        });
        
        const timeElement = this.statusBarElement.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    // Add haptic feedback simulation
    static addHapticFeedback(element) {
        if (!element) return;
        
        element.addEventListener('touchstart', () => {
            element.classList.add('haptic-feedback');
            setTimeout(() => {
                element.classList.remove('haptic-feedback');
            }, 100);
        });
    }

    // iOS-style alert
    static showAlert(title, message, buttons = [{ text: 'OK', primary: true }]) {
        // Remove existing alert
        const existingAlert = document.querySelector('.ios-alert');
        if (existingAlert) existingAlert.remove();

        const alertElement = document.createElement('div');
        alertElement.className = 'ios-alert';
        
        const buttonsHTML = buttons.map(btn => 
            `<button class="alert-button ${btn.primary ? 'primary' : ''}" onclick="${btn.action || 'this.closest(\'.ios-alert\').remove()'}">${btn.text}</button>`
        ).join('');

        alertElement.innerHTML = `
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
            <div class="alert-buttons">${buttonsHTML}</div>
        `;

        document.body.appendChild(alertElement);

        // Auto-remove after 5 seconds if no action
        setTimeout(() => {
            if (document.contains(alertElement)) {
                alertElement.remove();
            }
        }, 5000);
    }
}

// Auto-initialize iOS mode
document.addEventListener('DOMContentLoaded', () => {
    if (!window.iosMode) {
        window.iosMode = new iOSMode();
        window.iosMode.init();
    }
});

// Export for global use
window.iOSMode = iOSMode;