/**
 * Universal Sidebar Loader
 * Dynamically loads the sidebar component into any page
 */

class SidebarLoader {
    static async loadSidebar(targetSelector = 'body', position = 'afterbegin') {
        try {
            // Determine the correct path to the sidebar component
            const currentPath = window.location.pathname;
            let sidebarPath = '';
            
            if (currentPath.includes('/views/')) {
                sidebarPath = '../../public/components/sidebar.html';
            } else {
                sidebarPath = 'public/components/sidebar.html';
            }
            
            const response = await fetch(sidebarPath);
            if (!response.ok) {
                console.warn('Could not load sidebar component');
                return false;
            }
            
            const sidebarHTML = await response.text();
            const targetElement = document.querySelector(targetSelector);
            
            if (targetElement) {
                targetElement.insertAdjacentHTML(position, sidebarHTML);
                
                // Update active navigation item
                this.updateActiveNavItem();
                
                // Initialize mobile navigation
                if (window.MobileNavigation) {
                    if (!window.mobileNav) {
                        window.mobileNav = new MobileNavigation();
                    }
                    window.mobileNav.init();
                }
                
                return true;
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
            return false;
        }
    }
    
    static updateActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.sidebar-menu a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('../', '').replace('./', ''))) {
                link.classList.add('active');
                
                // If it's a submenu item, also show the parent dropdown
                const submenu = link.closest('.sidebar-submenu');
                if (submenu) {
                    submenu.classList.add('show');
                    submenu.setAttribute('aria-hidden', 'false');
                    
                    const toggle = document.querySelector(`[aria-controls="${submenu.id}"]`);
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'true');
                    }
                }
            }
        });
    }
    
    static updateBrandLink() {
        const brandLink = document.querySelector('.sidebar-brand');
        if (brandLink) {
            const currentPath = window.location.pathname;
            if (currentPath.includes('/views/')) {
                brandLink.href = '../../index.html';
            } else {
                brandLink.href = 'index.html';
            }
        }
    }
}

// Auto-load sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only load if sidebar doesn't already exist
    if (!document.getElementById('sidebar')) {
        SidebarLoader.loadSidebar();
    }
});

window.SidebarLoader = SidebarLoader;