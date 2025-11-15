// ============================================
// AUTHENTICATION GUARD
// ============================================

let appInitialized = false;

// Check authentication status and redirect if not logged in
auth.onAuthStateChanged(async (user) => {
  authReady = true;
  
  if (!user) {
    // User is not logged in, redirect to login page
    if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
      window.location.href = 'login.html';
    }
  } else {
    // User is logged in, display user info
    displayUserInfo(user);
    
    // Initialize app if not already initialized and we're on the main page
    if (!appInitialized && (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
      await initializeAppWithAuth();
    }
  }
});

// Display user information in the header
function displayUserInfo(user) {
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = user.email || 'User';
  }
}

// Initialize app after authentication is confirmed
async function initializeAppWithAuth() {
  if (appInitialized) return;
  appInitialized = true;
  
  try {
    // Wait a bit to ensure DOM is ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Load logs from Firestore
    await loadLogs();
    
    // Update UI
    renderHistory();
    updateChart();
    updateStatistics();
    
    // Setup event listeners if not already done
    if (typeof setupEventListeners === 'function') {
      setupEventListeners();
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await auth.signOut();
        // Redirect to login page after logout
        window.location.href = 'login.html';
      } catch (error) {
        console.error('Error signing out:', error);
        alert('An error occurred while logging out. Please try again.');
      }
    });
  }
  
  // If auth is already ready, initialize app
  if (authReady && auth.currentUser && !appInitialized) {
    initializeAppWithAuth();
  }
});

