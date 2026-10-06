// Centralized front-end configuration
// Auto-detect API base when not explicitly set.
// If you need a custom API domain/path, set window.API_BASE before this file loads.

// Auto-detect a sensible default: assume backend/ lives under the same site root
(function() {
    if (window.API_BASE) return; // don't override if user set it elsewhere

    const isFile = (window.location.protocol === 'file:');
    if (isFile) {
        // When opened from filesystem, fall back to a localhost default.
        window.API_BASE = 'http://localhost/site1/backend/';
        return;
    }

    const origin = window.location.origin;
    const path = window.location.pathname;
    // Derive the site folder (first path segment), so API_BASE works from nested pages
    // e.g., '/site1/views/dashboard/dashboard.html' -> 'site1'
    const parts = path.split('/').filter(Boolean);
    const siteFolder = parts.length > 0 ? parts[0] : '';
    const base = siteFolder ? (`/${siteFolder}/`) : '/';
    window.API_BASE = origin + base + 'backend/';
})();
