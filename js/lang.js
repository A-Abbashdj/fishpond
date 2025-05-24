let currentLang = 'en';

const translations = {
  en: {
    loginTitle: "🔐 SLU Fish Pond Control Room Entrance",
    username: "Username",
    password: "Password",
    login: "Login",
    error: "🚫 Invalid credentials. Access denied.",
    turbidityTitle: "🌊 Pond Turbidity",
    phTitle: "🌡️ Pond pH",
    tdsTitle: "🧪 Pond TDS",
    signal: "Signal",
    updated: "Updated",
    status: "Status",
    welcome: "Welcome to SLU Smart Fish Pond",
    pumpTitle: "Pump Controller",
    pumpIn: "Pump In",
    pumpOut: "Pump Out",
    ultrasonicTitle: "📏 Water Depth",
    ultraStatusOverflow: "Sensor in danger: water too high",
    ultraStatusFull: "Everything fine",
    ultraStatusWarn: "Careful: water reducing",
    ultraStatusLow: "Lives in danger",
    ultraStatusCritical: "Emergency level!"
  },

  ha: {
    loginTitle: "🔐 Mashigar Dakin Kulawar Tafkin Kifin SLU",
    username: "Inkiyar Mai Kula",
    password: "Kalmar Sirri",
    login: "Shiga",
    error: "🚫 Akwai Kuskure A Bayanan Da Ka Shigar.",
    turbidityTitle: "🌊 Kazantar Ruwa",
    phTitle: "🌡️ Ma'aunin pH",
    tdsTitle: "🧪 Ma'aunin TDS",
    signal: "Sakamako",
    updated: "Sabuntawa",
    status: "Matsayi",
    welcome: "Barka Da Zuwa Dakin Kulawar Tafkin Kifin SLU",
    pumpTitle: "Na'urar Pampo",
    pumpIn: "Shigar da Ruwa",
    pumpOut: "Fitar da Ruwa",
    ultrasonicTitle: "📏 Zurfin Ruwa",
    ultraStatusOverflow: "Sensor na cikin hadari: ruwa ya yi yawa",
    ultraStatusFull: "Komai lafiya",
    ultraStatusWarn: "Hankali: ruwa na raguwa",
    ultraStatusLow: "Rayuka a hadari",
    ultraStatusCritical: "Matakin gaggawa!"
  }
};

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ha' : 'en';
  document.getElementById('lang-label').textContent = currentLang.toUpperCase();
  const t = translations[currentLang];

  updateText("login-title", t.loginTitle);
  updateText("username", t.username, true);
  updateText("password", t.password, true);
  updateText("login-button", t.login);
  updateText("login-error", "");
  updateText("header-welcome", t.welcome);

  updateText("turbidity-title", t.turbidityTitle);
  updateText("ph-title", t.phTitle);
  updateText("tds-title", t.tdsTitle);
  updateText("label-signal", t.signal);
  updateText("label-signal-2", t.signal);
  updateText("label-signal-3", t.signal);
  updateText("label-updated", t.updated);
  updateText("label-updated-2", t.updated);
  updateText("label-updated-3", t.updated);

  updateText("label-pumpin", t.pumpIn);
  updateText("label-pumpout", t.pumpOut);
  updateText("pump-title", t.pumpTitle);
  updateText("ultrasonic-title", t.ultrasonicTitle);
}

function updateText(id, text, isPlaceholder = false) {
  const el = document.getElementById(id);
  if (el) {
    if (isPlaceholder) el.placeholder = text;
    else el.textContent = text;
  }
}
