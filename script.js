// Minimal working login system
console.log('Script loaded');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready');
    
    // Get elements
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const dashboardScreen = document.getElementById('dashboardScreen');
    const errorAlert = document.getElementById('errorAlert');
    const errorText = document.getElementById('errorText');
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('Elements found:', {
        loginForm: !!loginForm,
        loginScreen: !!loginScreen,
        dashboardScreen: !!dashboardScreen,
        errorAlert: !!errorAlert,
        loginBtn: !!loginBtn
    });
    
    // Check if already logged in
    if (localStorage.getItem('logged_in') === 'true') {
        showDashboard();
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            console.log('Credentials:', username, password);
            
            // Show loading
            showLoading(true);
            hideError();
            
            // Check credentials after delay
            setTimeout(function() {
                if (username === 'admin' && password === 'admin') {
                    console.log('Login success');
                    localStorage.setItem('logged_in', 'true');
                    showLoading(false);
                    showDashboard();
                } else {
                    console.log('Login failed');
                    showLoading(false);
                    showError('Invalid credentials');
                }
            }, 1000);
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Logout clicked');
            localStorage.removeItem('logged_in');
            showLogin();
        });
    }
    
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function() {
            userDropdown.classList.add('hidden');
        });
    }
    
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(nav) {
                nav.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
    }
    
    function showLogin() {
        console.log('Showing login');
        if (loginScreen && dashboardScreen) {
            loginScreen.classList.add('active');
            dashboardScreen.classList.remove('active');
        }
        
        // Reset form
        if (loginForm) {
            loginForm.reset();
        }
        hideError();
        showLoading(false);
    }
    
    function showDashboard() {
        console.log('Showing dashboard');
        if (loginScreen && dashboardScreen) {
            loginScreen.classList.remove('active');
            dashboardScreen.classList.add('active');
        }
        
        // Animate stats
        setTimeout(function() {
            const statCards = document.querySelectorAll('.stat-card');
            statCards.forEach(function(card, index) {
                setTimeout(function() {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 200);
    }
    
    function showLoading(loading) {
        if (!loginBtn) return;
        
        const buttonContent = loginBtn.querySelector('.button-content');
        const buttonLoader = loginBtn.querySelector('.button-loader');
        
        if (loading) {
            if (buttonContent) buttonContent.style.opacity = '0';
            if (buttonLoader) buttonLoader.classList.remove('hidden');
            loginBtn.disabled = true;
        } else {
            if (buttonContent) buttonContent.style.opacity = '1';
            if (buttonLoader) buttonLoader.classList.add('hidden');
            loginBtn.disabled = false;
        }
    }
    
    function showError(message) {
        if (errorText) errorText.textContent = message;
        if (errorAlert) errorAlert.classList.remove('hidden');
        
        // Shake effect
        const loginGlass = document.querySelector('.login-glass');
        if (loginGlass) {
            loginGlass.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(function() {
                loginGlass.style.animation = '';
            }, 500);
        }
        
        // Auto hide
        setTimeout(function() {
            hideError();
        }, 5000);
    }
    
    function hideError() {
        if (errorAlert) errorAlert.classList.add('hidden');
    }
});

// Add shake animation
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
}
`;
document.head.appendChild(style);

console.log('🔐 Login: admin / admin');
