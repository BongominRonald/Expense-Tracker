/**
 * Universal Sidebar Controller
 * Gmail-style sidebar functionality
 */

class SidebarController {
    constructor() {
        this.sidebar = null;
        this.mobileToggle = null;
        this.closeBtn = null;
        this.overlay = null;
        this.isOpen = false;
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.sidebar = document.getElementById('sidebar');
            this.mobileToggle = document.getElementById('mobileToggle');
            this.closeBtn = document.getElementById('sidebarToggle');
            this.overlay = document.getElementById('sidebarOverlay');

            if (!this.sidebar) return;

            this.setupEventListeners();
            this.restoreState();
            this.setupResponsiveBehavior();
        });
    }

    setupResponsiveBehavior() {
        // Handle window resize for better device switching
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.isOpen) {
                // On larger screens, keep sidebar open but adjust layout
                this.sidebar.classList.remove('collapsed');
            } else if (window.innerWidth <= 768 && this.isOpen) {
                // On mobile, ensure proper mobile behavior
                this.sidebar.classList.add('collapsed');
            }
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.innerWidth <= 768) {
                    this.close();
                }
            }, 100);
        });
    }

    setupEventListeners() {
        // Mobile toggle button
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Close button
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Overlay click
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Dropdown toggles
        this.setupDropdowns();
    }

    setupDropdowns() {
        const dropdownToggles = document.querySelectorAll('.sidebar .dropdown-toggle');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = toggle.getAttribute('aria-controls');
                const submenu = document.getElementById(targetId);
                
                if (submenu) {
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
                    
                    // Close all other dropdowns
                    dropdownToggles.forEach(otherToggle => {
                        if (otherToggle !== toggle) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                            const otherTargetId = otherToggle.getAttribute('aria-controls');
                            const otherSubmenu = document.getElementById(otherTargetId);
                            if (otherSubmenu) {
                                otherSubmenu.classList.remove('show');
                                otherSubmenu.setAttribute('aria-hidden', 'true');
                            }
                        }
                    });
                    
                    // Toggle current dropdown
                    toggle.setAttribute('aria-expanded', !isExpanded);
                    submenu.classList.toggle('show', !isExpanded);
                    submenu.setAttribute('aria-hidden', isExpanded);
                }
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('show');
        this.sidebar.classList.remove('collapsed');
        
        if (this.overlay) {
            this.overlay.style.display = 'block';
        }
        
        if (this.mobileToggle) {
            this.mobileToggle.style.display = 'none';
        }
        
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Save state
        try {
            localStorage.setItem('sfm.sidebar.open', '1');
        } catch (e) {}
    }

    close() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('show');
        
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
        
        if (this.mobileToggle) {
            this.mobileToggle.style.display = 'inline-flex';
        }
        
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Save state
        try {
            localStorage.setItem('sfm.sidebar.open', '0');
        } catch (e) {}
    }

    restoreState() {
        try {
            const saved = localStorage.getItem('sfm.sidebar.open');
            if (saved === '1') {
                this.open();
            }
        } catch (e) {}
    }
}

// Initialize sidebar when DOM is ready
new SidebarController();
