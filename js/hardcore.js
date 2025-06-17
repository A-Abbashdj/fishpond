  function handleLogin() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const error = document.getElementById("login-error");
    if (user === "admin" && pass === "fcit") {
      window.location.href = "dashboard.html";
    } else {
      error.innerText = translations[currentLang].error;
    }
  }