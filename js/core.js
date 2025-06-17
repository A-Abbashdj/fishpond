// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyDokhWXLtnvx18nb8wPF8L1BbVD_DG4wlQ",
  authDomain: "ultrasonic-c1db6.firebaseapp.com",
  databaseURL: "https://ultrasonic-c1db6-default-rtdb.firebaseio.com",
  projectId: "ultrasonic-c1db6",
  storageBucket: "ultrasonic-c1db6.appspot.com",
  messagingSenderId: "5416318045",
  appId: "1:5416318045:web:757ff08515faae2f1649b4"
};
firebase.initializeApp(firebaseConfig);

// === Firebase Refs ===
const turbidityRef = firebase.database().ref("turbidity");
const phRef = firebase.database().ref("ph");
const tdsRef = firebase.database().ref("tds");
const ultrasonicRef = firebase.database().ref("ultrasonic");
const temperatureRef = firebase.database().ref("temperature");
const pumpsRef = firebase.database().ref("pumps");

// === Smart Audio Map ===
const audioMap = {
  temperature: new Audio('./sounds/temp_alert.mp3'),
  ph: new Audio('./sounds/ph_drop.mp3'),
  tds: new Audio('./sounds/tds_beep.mp3'),
  turbidity: new Audio('./sounds/turbidity_alert.mp3'),
  ultrasonic: new Audio('./sounds/ultra_alarm.mp3')
};

// === Previous States (for change detection) ===
let prevStates = {
  turbidity: null,
  ph: null,
  tds: null,
  temperature: null,
  ultrasonic: null
};

// === Chart Utility ===
function updateChart(chart, value) {
  const now = new Date().toLocaleTimeString();
  if (chart.data.labels.length >= 5) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(value);
  chart.update();
}

// === Pump Logic ===
function togglePump(pumpKey) {
  const state = document.getElementById(`${pumpKey}Toggle`).checked;
  firebase.database().ref(`pumps/${pumpKey}`).set(state);
}

pumpsRef.on("value", snapshot => {
  const data = snapshot.val() || {};
  document.getElementById("pumpInToggle").checked = !!data.pumpIn;
  document.getElementById("pumpOutToggle").checked = !!data.pumpOut;
});

// === Turbidity Listener ===
turbidityRef.on("value", snapshot => {
  const data = snapshot.val();
  const value = parseFloat(data.value || 0);
  const status = data.status || "N/A";
  const isClean = status.toLowerCase().includes("clean");

  document.getElementById("value").innerText = value.toFixed(2);
  document.getElementById("status-text").innerText = status;
  document.getElementById("status-icon").innerText = isClean ? "🟢" : "🔴";
  document.getElementById("timestamp").innerText = new Date().toLocaleTimeString();
  updateChart(turbidityChart, value);

  if (status !== prevStates.turbidity) {
    audioMap.turbidity.play();
    prevStates.turbidity = status;
  }
});

// === pH Listener ===
phRef.on("value", snapshot => {
  const data = snapshot.val();
  const value = parseFloat(data.value || 0);
  let status = "Neutral", icon = "🟢";
  if (value < 6.5) { status = "Acidic"; icon = "🔵"; }
  else if (value > 8.5) { status = "Alkaline"; icon = "🟠"; }

  document.getElementById("ph-value").innerText = value.toFixed(2);
  document.getElementById("ph-status-text").innerText = status;
  document.getElementById("ph-status-icon").innerText = icon;
  document.getElementById("ph-timestamp").innerText = new Date().toLocaleTimeString();
  updateChart(phChart, value);

  if (status !== prevStates.ph) {
    audioMap.ph.play();
    prevStates.ph = status;
  }
});

// === TDS Listener ===
tdsRef.on("value", snapshot => {
  const data = snapshot.val();
  const value = parseFloat(data.value || 0);
  let status = "Normal", icon = "🟢";
  if (value < 1000) { status = "Low"; icon = "🔵"; }
  else if (value > 3000) { status = "High"; icon = "🔴"; }

  document.getElementById("tds-value").innerText = value.toFixed(2);
  document.getElementById("tds-status-text").innerText = status;
  document.getElementById("tds-status-icon").innerText = icon;
  document.getElementById("tds-timestamp").innerText = new Date().toLocaleTimeString();
  updateChart(tdsChart, value);

  if (status !== prevStates.tds) {
    audioMap.tds.play();
    prevStates.tds = status;
  }
});

// === Ultrasonic Listener ===
ultrasonicRef.on("value", (snapshot) => {
  const data = snapshot.val();
  const distance = parseFloat(data.distance || 0);
  const t = translations[currentLang];
  let status = "Unknown", icon = "⚪";

  if (distance > 11.5) {
    status = t.ultraStatusOverflow; icon = "🚨";
  } else if (distance >= 8) {
    status = t.ultraStatusFull; icon = "🟢";
  } else if (distance >= 6) {
    status = t.ultraStatusWarn; icon = "🟠";
  } else if (distance >= 0) {
    status = t.ultraStatusLow; icon = "🔴";
  } else {
    status = t.ultraStatusCritical; icon = "🚨";
  }

  document.getElementById("ultrasonic-value").innerText = distance.toFixed(2) + " cm";
  document.getElementById("ultrasonic-status-text").innerText = status;
  document.getElementById("ultrasonic-status-icon").innerText = icon;
  document.getElementById("ultrasonic-timestamp").innerText = new Date().toLocaleTimeString();

  if (status !== prevStates.ultrasonic) {
    audioMap.ultrasonic.play();
    prevStates.ultrasonic = status;
  }
});

// === Temperature Listener ===
temperatureRef.on("value", snapshot => {
  const data = snapshot.val();
  const value = parseFloat(data.value || 0);
  const status = data.status || "N/A";
  let icon = "⚪";

  if (value < 20) icon = "🔵";
  else if (value <= 30) icon = "🟢";
  else icon = "🔴";

  document.getElementById("temperature-value").innerText = value.toFixed(2) + " °C";
  document.getElementById("temperature-status-text").innerText = status;
  document.getElementById("temperature-status-icon").innerText = icon;
  document.getElementById("temperature-timestamp").innerText = new Date().toLocaleTimeString();
  updateChart(temperatureChart, value);

  if (status !== prevStates.temperature) {
    audioMap.temperature.play();
    prevStates.temperature = status;
  }
});

// === Charts (Unchanged) ===
const turbidityChart = new Chart(document.getElementById("turbidityChart").getContext("2d"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "NTU", data: [], borderColor: "#00f6ff", backgroundColor: "rgba(0, 246, 255, 0.2)", fill: true, tension: 0.3 }] },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { beginAtZero: true } } }
});

const phChart = new Chart(document.getElementById("phChart").getContext("2d"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "pH", data: [], borderColor: "#ff00c8", backgroundColor: "rgba(255, 0, 200, 0.2)", fill: true, tension: 0.3 }] },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { beginAtZero: true } } }
});

const tdsChart = new Chart(document.getElementById("tdsChart").getContext("2d"), {
  type: "line",
  data: { labels: [], datasets: [{ label: "ppm", data: [], borderColor: "#ffbf00", backgroundColor: "rgba(255, 191, 0, 0.2)", fill: true, tension: 0.3 }] },
  options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { beginAtZero: true } } }
});

const temperatureChart = new Chart(document.getElementById("temperatureChart").getContext("2d"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "°C",
      data: [],
      borderColor: "#ff5733",
      backgroundColor: "rgba(255, 87, 51, 0.2)",
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { beginAtZero: true }
    }
  }
});

const feederRef = firebase.database().ref("feeder");

function toggleFeeder() {
  const isActive = document.getElementById("feederToggle").checked;
  firebase.database().ref("feeder").set(isActive);
  
  const label = document.getElementById("feeder-label");
  label.textContent = isActive ? "Deactivate Feeder" : "Activate Feeder";
}

// Optional: initialize feeder label on page load
firebase.database().ref("feeder").on("value", snapshot => {
  const value = !!snapshot.val();
  document.getElementById("feederToggle").checked = value;

  const label = document.getElementById("feeder-label");
  label.textContent = value ? "Deactivate Feeder" : "Activate Feeder";
});



function goToDashboard() {
    window.location.href = "dashboard.html";
  }

// === Live Camera Feed Setup ===
const cameraRef = firebase.database().ref("camera/streamUrl");

cameraRef.on("value", snapshot => {
  const streamUrl = snapshot.val();
  const video = document.getElementById("camera-stream");
  if (streamUrl && video) {
    video.src = streamUrl;
  }
});

let isFloating = false;
  const cameraBox = document.getElementById('camera-box');
  const floatBtn = document.getElementById('float-btn');

  function toggleFloat() {
    isFloating = !isFloating;
    if (isFloating) {
      cameraBox.style.position = 'fixed';
      cameraBox.style.bottom = '20px';
      cameraBox.style.right = '20px';
      cameraBox.style.width = '300px';
      cameraBox.style.zIndex = '1000';
      cameraBox.style.border = '2px solid #00f6ff';
      floatBtn.textContent = '❌ Cancel Float';
    } else {
      cameraBox.style.position = 'relative';
      cameraBox.style.width = '100%';
      cameraBox.style.border = 'none';
      floatBtn.textContent = '🪟 Float';
    }
  }

  function takeSnapshot() {
    const video = document.getElementById("camera-stream");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "pond_snapshot.png";
    link.click();
  }
  
  function logout() {
    // Clear pond state (optional)
    localStorage.removeItem("activePond");
    // Redirect to login
    window.location.href = "index.html";
  }

  function enterPond(pondName) {
    localStorage.setItem("activePond", pondName);
    window.location.href = "mobile.html";
  }

  renderPonds(); // Ensure pond rendering still runs
