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

  const turbidityRef = firebase.database().ref("turbidity");
  const phRef = firebase.database().ref("ph");
  const tdsRef = firebase.database().ref("tds");
  const pumpsRef = firebase.database().ref("pumps");
  const ultrasonicRef = firebase.database().ref("ultrasonic");

  function togglePump(pumpKey) {
    const state = document.getElementById(`${pumpKey}Toggle`).checked;
    firebase.database().ref(`pumps/${pumpKey}`).set(state);
  }

  pumpsRef.on("value", snapshot => {
    const data = snapshot.val() || {};
    document.getElementById("pumpInToggle").checked = !!data.pumpIn;
    document.getElementById("pumpOutToggle").checked = !!data.pumpOut;
  });

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
  });

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
  });

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
  });

  ultrasonicRef.on("value", (snapshot) => {
    const data = snapshot.val();
    const distance = parseFloat(data.distance || 0);
    document.getElementById("ultrasonic-value").innerText = distance.toFixed(2) + " cm";
    document.getElementById("ultrasonic-timestamp").innerText = new Date().toLocaleTimeString();

    const t = translations[currentLang];

    if (distance > 11.5) {
      document.getElementById("ultrasonic-status-text").innerText = t.ultraStatusOverflow;
      document.getElementById("ultrasonic-status-icon").innerText = "🚨";
    } else if (distance >= 8) {
      document.getElementById("ultrasonic-status-text").innerText = t.ultraStatusFull;
      document.getElementById("ultrasonic-status-icon").innerText = "🟢";
    } else if (distance >= 6) {
      document.getElementById("ultrasonic-status-text").innerText = t.ultraStatusWarn;
      document.getElementById("ultrasonic-status-icon").innerText = "🟠";
    } else if (distance >= 0) {
      document.getElementById("ultrasonic-status-text").innerText = t.ultraStatusLow;
      document.getElementById("ultrasonic-status-icon").innerText = "🔴";
    } else {
      document.getElementById("ultrasonic-status-text").innerText = t.ultraStatusCritical;
      document.getElementById("ultrasonic-status-icon").innerText = "🚨";
    }
  });

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