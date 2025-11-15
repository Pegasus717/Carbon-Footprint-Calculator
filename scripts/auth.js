// ============================================
// AUTHENTICATION LOGIC
// ============================================

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const messageContainer = document.getElementById('messageContainer');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');

// State
let isLoginMode = true;

// Utility Functions
function showMessage(message, type = 'error') {
  messageContainer.className = type === 'error' ? 'error-message' : 'success-message';
  messageContainer.textContent = message;
  messageContainer.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageContainer.classList.add('hidden');
  }, 5000);
}

function hideMessage() {
  messageContainer.classList.add('hidden');
}

function showFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(errorId);
  field.classList.add('error');
  errorSpan.textContent = message;
  errorSpan.classList.remove('hidden');
}

function clearFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(errorId);
  field.classList.remove('error');
  errorSpan.classList.add('hidden');
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function setLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span>Processing...';
  } else {
    button.disabled = false;
    if (buttonId === 'loginBtn') {
      button.textContent = 'Sign In';
    } else {
      button.textContent = 'Create Account';
    }
  }
}

// Save user data to Firestore
async function saveUserData(user, additionalData = {}) {
  try {
    const userData = {
      uid: user.uid,
      email: user.email,
      loginTimestamp: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...additionalData
    };

    // Check if user document already exists
    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (userDoc.exists) {
      // Update existing user document
      await db.collection('users').doc(user.uid).update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        ...additionalData
      });
    } else {
      // Create new user document
      await db.collection('users').doc(user.uid).set(userData);
    }

    // Also save login history
    await db.collection('loginHistory').add({
      uid: user.uid,
      email: user.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
}

// Login Handler
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  // Clear previous errors
  clearFieldError('loginEmail', 'loginEmailError');
  clearFieldError('loginPassword', 'loginPasswordError');

  // Validation
  let hasError = false;

  if (!email) {
    showFieldError('loginEmail', 'loginEmailError', 'Email is required');
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('loginEmail', 'loginEmailError', 'Please enter a valid email address');
    hasError = true;
  }

  if (!password) {
    showFieldError('loginPassword', 'loginPasswordError', 'Password is required');
    hasError = true;
  } else if (!validatePassword(password)) {
    showFieldError('loginPassword', 'loginPasswordError', 'Password must be at least 6 characters');
    hasError = true;
  }

  if (hasError) {
    return;
  }

  setLoading('loginBtn', true);

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user data to Firestore
    await saveUserData(user);

    showMessage('Login successful! Redirecting...', 'success');
    
    // Redirect to main app after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    setLoading('loginBtn', false);
    let errorMessage = 'An error occurred during login. Please try again.';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    showMessage(errorMessage, 'error');
  }
});

// Sign Up Handler
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessage();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Clear previous errors
  clearFieldError('signupEmail', 'signupEmailError');
  clearFieldError('signupPassword', 'signupPasswordError');
  clearFieldError('confirmPassword', 'confirmPasswordError');

  // Validation
  let hasError = false;

  if (!email) {
    showFieldError('signupEmail', 'signupEmailError', 'Email is required');
    hasError = true;
  } else if (!validateEmail(email)) {
    showFieldError('signupEmail', 'signupEmailError', 'Please enter a valid email address');
    hasError = true;
  }

  if (!password) {
    showFieldError('signupPassword', 'signupPasswordError', 'Password is required');
    hasError = true;
  } else if (!validatePassword(password)) {
    showFieldError('signupPassword', 'signupPasswordError', 'Password must be at least 6 characters');
    hasError = true;
  }

  if (!confirmPassword) {
    showFieldError('confirmPassword', 'confirmPasswordError', 'Please confirm your password');
    hasError = true;
  } else if (password !== confirmPassword) {
    showFieldError('confirmPassword', 'confirmPasswordError', 'Passwords do not match');
    hasError = true;
  }

  if (hasError) {
    return;
  }

  setLoading('signupBtn', true);

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Prepare additional user data
    const additionalData = {};
    if (name) {
      additionalData.name = name;
    }
    additionalData.preferences = {
      theme: 'dark',
      notifications: true
    };

    // Save user data to Firestore
    await saveUserData(user, additionalData);

    showMessage('Account created successfully! Redirecting...', 'success');
    
    // Redirect to main app after short delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    setLoading('signupBtn', false);
    let errorMessage = 'An error occurred during sign up. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak. Please choose a stronger password.';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = error.message || errorMessage;
    }

    showMessage(errorMessage, 'error');
  }
});

// Toggle between Login and Sign Up
toggleLink.addEventListener('click', () => {
  isLoginMode = !isLoginMode;
  
  if (isLoginMode) {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    toggleText.textContent = "Don't have an account?";
    toggleLink.textContent = 'Sign up';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign in';
  }
  
  hideMessage();
  // Clear all form fields
  loginForm.reset();
  signupForm.reset();
  // Clear all errors
  document.querySelectorAll('[id$="Error"]').forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
  document.querySelectorAll('.input-field').forEach(el => {
    el.classList.remove('error');
  });
});

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
  if (user && window.location.pathname.includes('login.html')) {
    // User is already logged in, redirect to main app
    window.location.href = 'index.html';
  }
});
