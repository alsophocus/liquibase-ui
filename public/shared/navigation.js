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
        
        this.currentPage = hash;
        this.updateActiveNavigation();
        
        // Only load page content if it's not dashboard or if dashboard content is missing
        if (hash !== 'dashboard' || !document.getElementById('statsGrid')) {
            this.loadPage(hash);
        } else {
            // Just update the header for dashboard
            this.updateHeader(hash);
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
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        // Show loading state
        contentArea.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 400px;">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #6366f1; margin-bottom: 16px;"></i>
                    <div style="color: #64748b;">Loading ${pageName}...</div>
                </div>
            </div>
        `;

        // Update header
        this.updateHeader(pageName);

        // Simulate page load and render content
        setTimeout(() => {
            this.renderPage(pageName);
        }, 300);
    }

    updateHeader(pageName) {
        const headerTitle = document.querySelector('.header-left h1');
        const headerSubtitle = document.querySelector('.header-left span');
        
        const pageInfo = {
            dashboard: { title: 'Dashboard', subtitle: 'Overview of your database operations' },
            databases: { title: 'Database Management', subtitle: 'Manage your database connections' },
            migrations: { title: 'Migration Management', subtitle: 'Manage your database migrations and changelog files' },
            analytics: { title: 'Analytics & Reports', subtitle: 'Advanced analytics and performance insights' },
            settings: { title: 'Settings', subtitle: 'Configure your Liquibase UI preferences and system settings' }
        };
        
        const info = pageInfo[pageName] || pageInfo.dashboard;
        if (headerTitle) headerTitle.textContent = info.title;
        if (headerSubtitle) headerSubtitle.textContent = info.subtitle;
    }

    renderPage(pageName) {
        const contentArea = document.querySelector('.content-area');
        if (!contentArea) return;

        // For dashboard, restore original content if it was replaced
        if (pageName === 'dashboard') {
            // Check if we need to restore the original dashboard
            if (!document.getElementById('statsGrid') || !document.getElementById('migrationChart')) {
                this.renderDashboard(contentArea);
            }
            return;
        }

        // For other pages, render their content
        switch (pageName) {
            case 'databases':
                this.renderDatabases(contentArea);
                break;
            case 'migrations':
                this.renderMigrations(contentArea);
                break;
            case 'analytics':
                this.renderAnalytics(contentArea);
                break;
            case 'settings':
                this.renderSettings(contentArea);
                break;
            default:
                this.renderDashboard(contentArea);
        }
    }

    renderDashboard(container) {
        container.innerHTML = `
            <div class="welcome-section">
                <h2 id="welcomeMessage">Welcome back! 👋</h2>
                <p>Here's what's happening with your database migrations today.</p>
            </div>
            
            <div class="stats-grid" id="statsGrid">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading statistics...
                </div>
            </div>
            
            <div class="dashboard-cards">
                <div class="chart-card">
                    <div class="card-header">
                        <h3>Migration Activity</h3>
                        <div class="chart-controls">
                            <select id="chartPeriod" onchange="updateChart()">
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                            </select>
                        </div>
                    </div>
                    <canvas id="migrationChart" style="max-height: 300px; height: 300px;"></canvas>
                </div>
                
                <div class="activity-card">
                    <div class="card-header">
                        <h3>Recent Activity</h3>
                        <div class="status-indicator" id="connectionStatus">
                            <i class="fas fa-circle" style="color: #10b981;"></i>
                            <span>Live</span>
                        </div>
                    </div>
                    <div class="activity-list" id="activityList">
                        <div class="loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            Loading activity...
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Advanced Features Section -->
            <div class="advanced-section">
                <div class="search-bar">
                    <input type="text" class="search-input" placeholder="Search migrations..." id="searchInput">
                    <select id="statusFilter">
                        <option value="">All Status</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                        <option value="running">Running</option>
                    </select>
                    <button class="filter-btn" onclick="applyFilters()">
                        <i class="fas fa-filter"></i> Filter
                    </button>
                    <button class="filter-btn" onclick="showUploadModal()">
                        <i class="fas fa-upload"></i> Upload
                    </button>
                </div>
                
                <div class="migration-list">
                    <div class="card-header">
                        <h3>Migration Management</h3>
                        <div>
                            <button class="action-btn primary" onclick="executeBulkMigrations()">
                                <i class="fas fa-play"></i> Execute Selected
                            </button>
                            <button class="action-btn" onclick="exportReport()">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    <div id="migrationsList">
                        <div class="loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            Loading migrations...
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Reinitialize dashboard functionality after a short delay
        setTimeout(() => {
            if (window.loadDashboard) {
                window.loadDashboard();
            }
            if (window.initChart) {
                window.initChart();
            }
            if (window.updateChart) {
                window.updateChart();
            }
        }, 100);
    }

    renderDatabases(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Database Connections</h2>
                    <p>Configure and manage your database connections for Liquibase migrations.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="window.testAllConnections()">
                        <i class="fas fa-check-circle"></i> Test All
                    </button>
                    <button class="btn btn-primary" onclick="window.showAddDatabaseModal()">
                        <i class="fas fa-plus"></i> Add Database
                    </button>
                </div>
            </div>

            <div class="database-grid" id="databaseGrid">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    Loading databases...
                </div>
            </div>

            <!-- Add Database Modal -->
            <div class="modal" id="addDatabaseModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Add Database Connection</h3>
                        <p>Configure a new database connection for your Liquibase migrations.</p>
                    </div>
                    
                    <form id="addDatabaseForm">
                        <div class="form-group">
                            <label for="dbName">Connection Name</label>
                            <input type="text" id="dbName" class="form-input" placeholder="My Database" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="dbType">Database Type</label>
                            <select id="dbType" class="form-select" required onchange="window.updateConnectionFields()">
                                <option value="">Select database type</option>
                                <option value="postgresql">PostgreSQL</option>
                                <option value="mysql">MySQL</option>
                                <option value="sqlite">SQLite</option>
                            </select>
                        </div>
                        
                        <div class="form-group" id="hostGroup">
                            <label for="dbHost">Host</label>
                            <input type="text" id="dbHost" class="form-input" placeholder="localhost">
                        </div>
                        
                        <div class="form-group" id="portGroup">
                            <label for="dbPort">Port</label>
                            <input type="number" id="dbPort" class="form-input" placeholder="5432">
                        </div>
                        
                        <div class="form-group">
                            <label for="dbDatabase">Database Name</label>
                            <input type="text" id="dbDatabase" class="form-input" placeholder="my_database" required>
                        </div>
                        
                        <div class="form-group" id="usernameGroup">
                            <label for="dbUsername">Username</label>
                            <input type="text" id="dbUsername" class="form-input" placeholder="username">
                        </div>
                        
                        <div class="form-group" id="passwordGroup">
                            <label for="dbPassword">Password</label>
                            <input type="password" id="dbPassword" class="form-input" placeholder="password">
                        </div>
                    </form>
                    
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="window.closeAddDatabaseModal()">Cancel</button>
                        <button class="btn btn-secondary" onclick="window.testNewConnection()" id="testBtn">Test Connection</button>
                        <button class="btn btn-primary" onclick="window.addDatabase()" id="addBtn">Add Database</button>
                    </div>
                </div>
            </div>
        `;
        
        // Load databases after rendering
        setTimeout(() => {
            if (window.loadDatabases) {
                window.loadDatabases();
            }
        }, 100);
    }

    renderMigrations(container) {
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title">
                    <h2>Migration Timeline</h2>
                    <p>Track and manage your database migration history and execution.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-secondary" onclick="alert('Refreshing migrations...')">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button class="btn btn-primary" onclick="alert('Upload modal would open here')">
                        <i class="fas fa-upload"></i> Upload Changelog
                    </button>
                </div>
            </div>

            <div class="migration-timeline">
                <div class="timeline-header">
                    <h3>Migration History</h3>
                    <span style="font-size: 14px; color: #64748b;">Showing recent migrations</span>
                </div>
                
                <div class="timeline">
                    <div class="timeline-item success">
                        <div class="migration-card">
                            <div class="migration-header">
                                <div class="migration-title">db.changelog-001-initial-schema.xml</div>
                                <span class="migration-status success">SUCCESS</span>
                            </div>
                            <div class="migration-meta">
                                <span><i class="fas fa-user"></i> admin</span>
                                <span><i class="fas fa-clock"></i> 2025-10-21 09:15:00</span>
                                <span><i class="fas fa-stopwatch"></i> 245ms</span>
                            </div>
                            <div class="migration-description">Initial database schema with users and roles tables</div>
                            <div class="migration-actions">
                                <button class="action-btn" onclick="alert('Rolling back...')">
                                    <i class="fas fa-undo"></i> Rollback
                                </button>
                                <button class="action-btn" onclick="alert('Viewing details...')">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAnalytics(container) {
        container.innerHTML = `
            <div class="analytics-header">
                <div class="analytics-title">
                    <h2>Migration Analytics</h2>
                    <p>Comprehensive insights into your database migration performance and trends.</p>
                </div>
                <div class="date-selector">
                    <select>
                        <option value="30" selected>Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                    <button class="btn btn-primary" onclick="alert('Exporting report...')">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Success Rate</span>
                        <div class="metric-icon success"><i class="fas fa-check"></i></div>
                    </div>
                    <div class="metric-value">94.2%</div>
                    <div class="metric-change positive"><i class="fas fa-arrow-up"></i> +2.1% from last month</div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">Avg Execution Time</span>
                        <div class="metric-icon info"><i class="fas fa-stopwatch"></i></div>
                    </div>
                    <div class="metric-value">1.2s</div>
                    <div class="metric-change positive"><i class="fas fa-arrow-down"></i> -0.3s faster</div>
                </div>
            </div>

            <div class="chart-placeholder" style="height: 300px; background: #f8fafc; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #64748b; margin-top: 24px;">
                <div style="text-align: center;">
                    <i class="fas fa-chart-line" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                    <div>Analytics charts would be rendered here</div>
                </div>
            </div>
        `;
    }

    renderSettings(container) {
        container.innerHTML = `
            <div class="settings-layout">
                <div class="settings-nav">
                    <h3>Settings</h3>
                    <div class="settings-nav-item active"><i class="fas fa-cog"></i><span>General</span></div>
                    <div class="settings-nav-item"><i class="fas fa-bell"></i><span>Notifications</span></div>
                    <div class="settings-nav-item"><i class="fas fa-shield-alt"></i><span>Security</span></div>
                </div>

                <div class="settings-content">
                    <div class="section-header">
                        <h2>General Settings</h2>
                        <p>Configure your basic preferences and display options.</p>
                    </div>
                    
                    <div class="setting-group">
                        <h3>Appearance</h3>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Dark Mode</h4>
                                <p>Switch between light and dark theme</p>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox">
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                        <div class="setting-item">
                            <div class="setting-info">
                                <h4>Auto-refresh</h4>
                                <p>Automatically refresh dashboard data</p>
                            </div>
                            <div class="setting-control">
                                <label class="toggle-switch">
                                    <input type="checkbox" checked>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize router
const router = new LiquibaseRouter();

// Export for use in other files
window.LiquibaseRouter = router;
