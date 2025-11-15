// ============================================
// AUTHENTICATION GUARD
// ============================================

// Check authentication status and redirect if not logged in
auth.onAuthStateChanged((user) => {
  if (!user) {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html';
  } else {
    // User is logged in, display user info
    displayUserInfo(user);
  }
});

// Display user information in the header
function displayUserInfo(user) {
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement) {
    userEmailElement.textContent = user.email || 'User';
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
});

