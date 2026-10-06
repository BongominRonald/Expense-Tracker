/**
 * Universal Mobile Navigation Component
 * Provides consistent mobile-first navigation across all pages
 */

class MobileNavigation {
    constructor() {
        this.STORAGE_KEY = 'sfm.sidebar.open';
        this.sidebar = null;
        this.mobileBtn = null;
        this.closeBtn = null;
        this.overlay = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // Get DOM elements
        this.sidebar = document.getElementById('sidebar');
        this.mobileBtn = document.getElementById('mobileToggle');
        this.closeBtn = document.getElementById('sidebarToggle');
        this.overlay = document.getElementById('sidebarOverlay');

        if (!this.sidebar) return;

        this.setupEventListeners();
        this.setupDropdownMenus();
        this.restoreState();
        this.initialized = true;
    }

    setupEventListeners() {
        // Mobile toggle button
        if (this.mobileBtn) {
            this.mobileBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSidebar();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeSidebar();
            }
        });
    }

    setupDropdownMenus() {
        const dropdownToggles = document.querySelectorAll('.sidebar .dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown(toggle);
            });

            // Keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleDropdown(toggle);
                }
            });
        });
    }

    toggleDropdown(toggle) {
        const targetId = toggle.getAttribute('aria-controls');
        const menu = targetId ? document.getElementById(targetId) : toggle.nextElementSibling;
        
        if (!menu) return;

        const willOpen = !menu.classList.contains('show');
        
        // Close all other submenus
        if (willOpen) {
            this.closeAllSubmenus(menu);
        }

        // Toggle current menu
        menu.classList.toggle('show', willOpen);
        menu.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    }

    closeAllSubmenus(except = null) {
        document.querySelectorAll('.sidebar-submenu').forEach(ul => {
            if (ul !== except) {
                ul.classList.remove('show');
                ul.setAttribute('aria-hidden', 'true');
                const ctrl = document.querySelector(`[aria-controls="${ul.id}"]`);
                if (ctrl) ctrl.setAttribute('aria-expanded', 'false');
            }
        });
    }

    toggleSidebar() {
        const isOpen = this.sidebar.classList.contains('show');
        if (isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        if (!this.sidebar) return;

        this.sidebar.classList.add('show');
        this.sidebar.classList.remove('collapsed');
        this.sidebar.setAttribute('aria-hidden', 'false');
        
        if (this.overlay) {
            this.overlay.style.display = 'block';
        }
        
        if (this.mobileBtn) {
            this.mobileBtn.style.display = 'none';
            this.mobileBtn.setAttribute('aria-expanded', 'true');
        }

        document.body.style.overflow = 'hidden';
        
        // Focus first interactive element
        const firstLink = this.sidebar.querySelector('a, button');
        if (firstLink) firstLink.focus();

        this.saveState(true);
    }

    closeSidebar() {
        if (!this.sidebar) return;

        this.sidebar.classList.remove('show');
        this.sidebar.setAttribute('aria-hidden', 'true');
        
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        if (this.mobileBtn) {
            this.mobileBtn.style.display = '';
            this.mobileBtn.setAttribute('aria-expanded', 'false');
        }

        document.body.style.overflow = '';
        
        // Return focus to toggle button
        if (this.mobileBtn) {
            this.mobileBtn.focus();
        }

        this.saveState(false);
    }

    saveState(isOpen) {
        try {
            localStorage.setItem(this.STORAGE_KEY, isOpen ? '1' : '0');
        } catch(_) {}
    }

    restoreState() {
        let initialOpen = false; // Default to closed for mobile-first
        
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved === '1') initialOpen = true;
            else if (saved === '0') initialOpen = false;
        } catch(_) {}

        if (initialOpen) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }

    // Public method to programmatically control sidebar
    setSidebarState(open) {
        if (open) {
            this.openSidebar();
        } else {
            this.closeSidebar();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!window.mobileNav) {
        window.mobileNav = new MobileNavigation();
        window.mobileNav.init();
    }
});

// Export for manual initialization if needed
window.MobileNavigation = MobileNavigation;