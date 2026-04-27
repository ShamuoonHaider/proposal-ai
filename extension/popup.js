// Proposal AI — Popup Script
// Handles login/logout and displays user state

const API_BASE_URL_DEFAULT = 'https://proposal-ai-back-end.vercel.app';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const loginSection = document.getElementById('loginSection');
  const loggedInSection = document.getElementById('loggedInSection');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signInBtn = document.getElementById('signInBtn');
  const signInText = document.getElementById('signInText');
  const signInSpinner = document.getElementById('signInSpinner');
  const errorMessage = document.getElementById('errorMessage');
  const createAccountLink = document.getElementById('createAccountLink');
  const logoutBtn = document.getElementById('logoutBtn');
  const userAvatar = document.getElementById('userAvatar');
  const userEmailEl = document.getElementById('userEmail');

  // Get API base URL
  async function getApiBaseUrl() {
    try {
      const result = await chrome.storage.local.get(['apiBaseUrl']);
      return result.apiBaseUrl || API_BASE_URL_DEFAULT;
    } catch (e) {
      return API_BASE_URL_DEFAULT;
    }
  }

  // Check if user is logged in
  async function checkAuth() {
    try {
      const result = await chrome.storage.local.get(['token', 'userEmail']);
      if (result.token && result.userEmail) {
        showLoggedIn(result.userEmail);
      } else {
        showLogin();
      }
    } catch (e) {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.style.display = 'block';
    loggedInSection.style.display = 'none';
  }

  function showLoggedIn(email) {
    loginSection.style.display = 'none';
    loggedInSection.style.display = 'block';
    userEmailEl.textContent = email;
    userAvatar.textContent = (email.charAt(0) || 'U').toUpperCase();
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.add('visible');
  }

  function hideError() {
    errorMessage.classList.remove('visible');
  }

  function setLoading(loading) {
    signInBtn.disabled = loading;
    signInText.textContent = loading ? 'Signing in...' : 'Sign In';
    signInSpinner.style.display = loading ? 'inline-block' : 'none';
  }

  // Sign In
  async function handleSignIn() {
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please fill in both email and password.');
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = await getApiBaseUrl();
      const res = await fetch(`${apiBaseUrl}/api/v1/users/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          showError('Invalid email or password.');
        } else if (res.status === 404) {
          showError('Account not found. Please create an account first.');
        } else {
          showError(data.message || 'Sign in failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      const token = data.data?.access_token || data.token || data.accessToken;
      if (!token) {
        showError('Server did not return a token. Please try again.');
        setLoading(false);
        return;
      }

      // Store token and email
      await chrome.storage.local.set({ token, userEmail: email });
      showLoggedIn(email);
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        showError('Unable to connect to server. Check your connection.');
      } else {
        showError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  // Logout
  async function handleLogout() {
    try {
      await chrome.storage.local.remove(['token', 'userEmail']);
    } catch (e) {
      // ignore
    }
    emailInput.value = '';
    passwordInput.value = '';
    hideError();
    showLogin();
  }

  // Create Account — opens the main app's signup page
  function handleCreateAccount(e) {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://proposal-ai-back-end.vercel.app/signup' });
  }

  // Event Listeners — use named handlers for clean binding
  signInBtn.addEventListener('click', handleSignIn);
  logoutBtn.addEventListener('click', handleLogout);
  createAccountLink.addEventListener('click', handleCreateAccount);

  // Enter key support
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignIn();
    }
  });

  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInput.focus();
    }
  });

  // Initialize
  checkAuth();
});
