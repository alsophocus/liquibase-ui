// Simple client-side router for Phase 5
class LiquibaseRouter {
    constructor() {
        this.routes = new Map();
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Handle hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial load
        this.handleRoute();
        
        // Add click handlers to navigation items
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
        });
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path) {
        window.location.hash = path;
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const handler = this.routes.get(hash);
        
        if (handler) {
            this.currentPage = hash;
            this.updateActiveNavigation();
            handler();
        } else {
            // Default to dashboard
            this.navigate('dashboard');
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigate(page);
                }
            });
        });
    }

    updateActiveNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }

    loadPage(pageName) {
        const contentArea = document.querySelector('.main-content');
        if (!contentArea) return;

        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh;">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #6366f1; margin-bottom: 16px;"></i>
                    <div style="color: #64748b;">Loading ${pageName}...</div>
                </div>
            </div>
        `;

        // Simulate page load (in real app, this would fetch the page)
        setTimeout(() => {
            this.renderPage(pageName);
        }, 300);
    }

    renderPage(pageName) {
        const contentArea = document.querySelector('.main-content');
        if (!contentArea) return;

        switch (pageName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'databases':
                this.renderDatabases();
                break;
            case 'migrations':
                this.renderMigrations();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'settings':
                this.renderSettings();
                break;
            default:
                this.renderDashboard();
        }
    }

    renderDashboard() {
        // Keep existing dashboard functionality
        window.location.href = '/dashboard.html';
    }

    renderDatabases() {
        window.location.href = '/databases.html';
    }

    renderMigrations() {
        window.location.href = '/migrations.html';
    }

    renderAnalytics() {
        window.location.href = '/analytics.html';
    }

    renderSettings() {
        window.location.href = '/settings.html';
    }
}

// Initialize router
const router = new LiquibaseRouter();

// Export for use in other files
window.LiquibaseRouter = router;
