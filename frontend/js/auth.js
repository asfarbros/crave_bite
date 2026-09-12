document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = window.API_URL || 'http://localhost:5000';
  
  function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const ordersLink = document.getElementById('ordersLink');
    const adminLink = document.getElementById('adminLink');

    if (token && user) {
      try {
        const userData = JSON.parse(user);
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) {
            userMenu.classList.remove('hidden');
            userMenu.classList.add('flex');
        }
        if (ordersLink) {
            ordersLink.classList.remove('hidden');
            ordersLink.style.display = 'inline';
        }
        if (adminLink) adminLink.classList.toggle('hidden', userData.role !== 'admin');
      } catch (e) {
        console.error("Error parsing user data", e);
        handleLocalLogout();
      }
    } else {
      if (authButtons) authButtons.classList.remove('hidden');
      if (userMenu) {
          userMenu.classList.add('hidden');
          userMenu.classList.remove('flex');
      }
      if (ordersLink) {
          ordersLink.classList.add('hidden');
          ordersLink.style.display = 'none';
      }
      if (adminLink) adminLink.classList.add('hidden');
    }
  }

  async function handleLogout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleLocalLogout();
    }
  }

  function handleLocalLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuthStatus();
    window.location.reload();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  checkAuthStatus();
});
