/**
 * Study Assist - Authentication JavaScript
 * Handles user authentication and profile management
 */

// User authentication state
const AUTH_STATE = {
    isLoggedIn: false,
    currentUser: null,
    userRole: null, // 'student', 'teacher', 'parent', 'admin'
    authToken: null,
    loginTimestamp: null
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupAuthUI();
});

/**
 * Initialize authentication state
 */
function initAuth() {
    // Check for stored authentication data
    const storedAuth = localStorage.getItem('study_assist_auth');
    
    if (storedAuth) {
        try {
            const authData = JSON.parse(storedAuth);
            
            // Verify token expiration
            if (authData.authToken && authData.loginTimestamp) {
                const currentTime = Date.now();
                const tokenAge = currentTime - authData.loginTimestamp;
                const tokenValidityDuration = 24 * 60 * 60 * 1000; // 24 hours
                
                if (tokenAge < tokenValidityDuration) {
                    // Token is still valid
                    Object.assign(AUTH_STATE, authData);
                } else {
                    // Token has expired
                    clearAuthData();
                }
            }
        } catch (e) {
            console.error('Error parsing stored auth data:', e);
            clearAuthData();
        }
    }
    
    // Update UI based on auth state
    updateAuthUI();
}

/**
 * Set up authentication UI elements and event listeners
 */
function setupAuthUI() {
    // Login button
    const loginBtn = document.querySelector('.btn-outline');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showLoginModal());
    }
    
    // Sign up button
    const signupBtn = document.querySelector('.btn-primary');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => showSignupModal());
    }
    
    // Create modals if they don't exist
    createAuthModals();
}

/**
 * Create authentication modals
 */
function createAuthModals() {
    // Create login modal if it doesn't exist
    if (!document.getElementById('login-modal')) {
        const loginModal = document.createElement('div');
        loginModal.id = 'login-modal';
        loginModal.className = 'modal';
        loginModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Log In</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary w-100">Log In</button>
                    </div>
                    <p class="text-center">
                        Don't have an account? <a href="#" id="show-signup">Sign up</a>
                    </p>
                </form>
            </div>
        `;
        document.body.appendChild(loginModal);
        
        // Add event listeners
        const closeBtn = loginModal.querySelector('.close');
        closeBtn.addEventListener('click', () => hideLoginModal());
        
        const showSignupLink = loginModal.querySelector('#show-signup');
        showSignupLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideLoginModal();
            showSignupModal();
        });
        
        const loginForm = loginModal.querySelector('#login-form');
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Create signup modal if it doesn't exist
    if (!document.getElementById('signup-modal')) {
        const signupModal = document.createElement('div');
        signupModal.id = 'signup-modal';
        signupModal.className = 'modal';
        signupModal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Sign Up</h2>
                <form id="signup-form">
                    <div class="form-group">
                        <label for="signup-name">Full Name</label>
                        <input type="text" id="signup-name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-email">Email</label>
                        <input type="email" id="signup-email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Password</label>
                        <input type="password" id="signup-password" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-role">I am a:</label>
                        <select id="signup-role" class="form-control" required>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn btn-primary w-100">Create Account</button>
                    </div>
                    <p class="text-center">
                        Already have an account? <a href="#" id="show-login">Log in</a>
                    </p>
                </form>
            </div>
        `;
        document.body.appendChild(signupModal);
        
        // Add event listeners
        const closeBtn = signupModal.querySelector('.close');
        closeBtn.addEventListener('click', () => hideSignupModal());
        
        const showLoginLink = signupModal.querySelector('#show-login');
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideSignupModal();
            showLoginModal();
        });
        
        const signupForm = signupModal.querySelector('#signup-form');
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }
    
    // Add modal styles if they don't exist
    if (!document.getElementById('modal-styles')) {
        const modalStyles = document.createElement('style');
        modalStyles.id = 'modal-styles';
        modalStyles.textContent = `
            .modal {
                display: none;
                position: fixed;
                z-index: 1001;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                align-items: center;
                justify-content: center;
            }
            
            .modal-content {
                background-color: white;
                padding: 2rem;
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-lg);
                width: 100%;
                max-width: 400px;
                position: relative;
            }
            
            .close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                font-size: 1.5rem;
                cursor: pointer;
            }
            
            .modal.show {
                display: flex;
            }
        `;
        document.head.appendChild(modalStyles);
    }
}

/**
 * Update UI based on current authentication state
 */
function updateAuthUI() {
    const loginBtn = document.getElementById('login-button');
    const signupBtn = document.getElementById('signup-button');
    
    if (AUTH_STATE.isLoggedIn && AUTH_STATE.currentUser) {
        // User is logged in
        if (loginBtn) {
            loginBtn.textContent = 'Profile';
            loginBtn.removeEventListener('click', showLoginModal);
            loginBtn.addEventListener('click', showUserProfile);
        }
        
        if (signupBtn) {
            signupBtn.textContent = 'Logout';
            signupBtn.removeEventListener('click', showSignupModal);
            signupBtn.addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.removeEventListener('click', showUserProfile);
            loginBtn.addEventListener('click', showLoginModal);
        }
        
        if (signupBtn) {
            signupBtn.textContent = 'Sign Up';
            signupBtn.removeEventListener('click', handleLogout);
            signupBtn.addEventListener('click', showSignupModal);
        }
    }
}

/**
 * Show login modal
 */
function showLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Hide login modal
 */
function hideLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Show signup modal
 */
function showSignupModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Hide signup modal
 */
function hideSignupModal() {
    const modal = document.getElementById('signup-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * Handle login form submission
 */
function handleLogin() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (emailInput && passwordInput) {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // For demo purposes, we'll simulate authentication
        // In a real app, this would make an API request
        simulateLogin(email, password);
    }
}

/**
 * Handle signup form submission
 */
function handleSignup() {
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const roleInput = document.getElementById('signup-role');
    
    if (nameInput && emailInput && passwordInput && roleInput) {
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const role = roleInput.value;
        
        // For demo purposes, we'll simulate user registration
        // In a real app, this would make an API request
        simulateSignup(name, email, password, role);
    }
}

/**
 * Handle logout action
 */
function handleLogout() {
    // Clear authentication data
    clearAuthData();
    
    // Update UI
    updateAuthUI();
    
    // Show logout message
    showMessage('You have been logged out successfully', 'success');
}

/**
 * Show user profile
 */
function showUserProfile() {
    // This would navigate to or show a profile page/modal
    // For demo purposes, we'll just show a message with user info
    if (AUTH_STATE.currentUser) {
        alert(`User Profile: ${AUTH_STATE.currentUser.name} (${AUTH_STATE.currentUser.email})\nRole: ${AUTH_STATE.userRole}`);
    }
}

/**
 * Clear authentication data
 */
function clearAuthData() {
    // Reset auth state
    AUTH_STATE.isLoggedIn = false;
    AUTH_STATE.currentUser = null;
    AUTH_STATE.userRole = null;
    AUTH_STATE.authToken = null;
    AUTH_STATE.loginTimestamp = null;
    
    // Clear stored auth data
    localStorage.removeItem('study_assist_auth');
}

/**
 * Show message to user
 * @param {String} message - The message text
 * @param {String} type - Message type ('success', 'error', 'info')
 */
function showMessage(message, type = 'info') {
    // Create the message element if it doesn't exist
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'message-container';
        document.body.appendChild(messageContainer);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .message-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
            }
            
            .message {
                padding: 12px 20px;
                margin-bottom: 10px;
                border-radius: var(--border-radius-md);
                box-shadow: var(--shadow-md);
                animation: slideIn 0.3s ease, fadeOut 0.5s ease 3s forwards;
            }
            
            .message.success {
                background-color: var(--success-color);
                color: white;
            }
            
            .message.error {
                background-color: var(--error-color);
                color: white;
            }
            
            .message.info {
                background-color: var(--primary-color);
                color: white;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create the message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Add to container
    messageContainer.appendChild(messageElement);
    
    // Remove after animation completes
    setTimeout(() => {
        messageElement.remove();
    }, 3500);
}

/* Simulation functions for demo purposes */

/**
 * Simulate user login
 * @param {String} email - User email
 * @param {String} password - User password
 */
function simulateLogin(email, password) {
    // For demo, we'll accept any properly formatted email with a password length >= 6
    if (isValidEmail(email) && password.length >= 6) {
        // Simulate successful login
        const userData = {
            id: generateId('user'),
            name: email.split('@')[0], // Use part of email as name for demo
            email: email
        };
        
        // Update auth state
        AUTH_STATE.isLoggedIn = true;
        AUTH_STATE.currentUser = userData;
        AUTH_STATE.userRole = 'student'; // Default role for demo
        AUTH_STATE.authToken = btoa(`${email}:${Date.now()}`); // Simple token simulation
        AUTH_STATE.loginTimestamp = Date.now();
        
        // Save to localStorage
        localStorage.setItem('study_assist_auth', JSON.stringify(AUTH_STATE));
        
        // Update UI
        updateAuthUI();
        
        // Hide login modal
        hideLoginModal();
        
        // Show success message
        showMessage('Login successful!', 'success');
    } else {
        // Show error message
        showMessage('Invalid email or password. Please try again.', 'error');
    }
}

/**
 * Simulate user registration
 * @param {String} name - User name
 * @param {String} email - User email
 * @param {String} password - User password
 * @param {String} role - User role
 */
function simulateSignup(name, email, password, role) {
    // Validate input
    if (name.length < 2) {
        showMessage('Please enter your full name', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Simulate successful registration
    const userData = {
        id: generateId('user'),
        name: name,
        email: email
    };
    
    // Update auth state (auto-login after signup)
    AUTH_STATE.isLoggedIn = true;
    AUTH_STATE.currentUser = userData;
    AUTH_STATE.userRole = role;
    AUTH_STATE.authToken = btoa(`${email}:${Date.now()}`);
    AUTH_STATE.loginTimestamp = Date.now();
    
    // Save to localStorage
    localStorage.setItem('study_assist_auth', JSON.stringify(AUTH_STATE));
    
    // Update UI
    updateAuthUI();
    
    // Hide signup modal
    hideSignupModal();
    
    // Show success message
    showMessage('Account created successfully!', 'success');
} 