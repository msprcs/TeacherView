document.querySelector('.form').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const error = document.getElementById('error-message');
  // Simple demo: you can add real auth here
  if (username === '' || password === '') {
    error.textContent = "Please enter your username and password.";
    error.style.color = "red";
    return;
  }
  // Simulate login (always successful for demo)
  error.textContent = "";
  // Redirect to landing page
  window.location.href = "landing.html";
});