const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// 🔐 Token check
if (!token || role !== "student") {
  alert("Unauthorized access. Please login again.");
  window.location.href = "index.html";
}

// 🧼 Schedule Laundry Session
document.getElementById("laundryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const machine = document.getElementById("machine").value;
  const laundryType = document.getElementById("laundryType").value;
  const itemCount = parseInt(document.getElementById("itemCount").value);
  const startTime = document.getElementById("startTime").value;

  if (!machine || !laundryType || !itemCount || !startTime) {
    alert("❌ All fields are required.");
    return;
  }

  try {
    const res = await fetch("/api/laundry/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ machine, laundryType, itemCount, startTime })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("✅ Session booked!");
      loadEverything();
    } else {
      alert("❌ Booking failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Laundry booking error:", err);
    alert("❌ Error connecting to server.");
  }
});

// 🟢 Load everything on page load
window.onload = loadEverything;

async function loadEverything() {
  await loadActive();
  await loadMachines();
  await loadHistory();
  await loadStats();
}

// 🔵 Active session
async function loadActive() {
  try {
    const res = await fetch("/api/laundry/active", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    const div = document.getElementById("activeContent");
    const btn = document.getElementById("markCompleteBtn");

    if (data.session) {
      const s = data.session;
      div.innerHTML = `
        <p>Machine: <b>${s.machine}</b></p>
        <p>Type: ${s.laundryType}</p>
        <p>Items: ${s.itemCount}</p>
        <p>Start: ${new Date(s.startTime).toLocaleString()}</p>
      `;
      btn.classList.remove("hidden");
    } else {
      div.textContent = "No active session.";
      btn.classList.add("hidden");
    }
  } catch (err) {
    console.error("Active session error:", err);
  }
}

// 🟩 Mark Complete
document.getElementById("markCompleteBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/api/laundry/complete", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert("✅ Session marked complete!");
      loadEverything();
    } else {
      alert("❌ Failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Mark complete error:", err);
  }
});

// 🧭 Machine Status
async function loadMachines() {
  try {
    const res = await fetch("/api/laundry/machines", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();

    const ul = document.getElementById("machines");
    ul.innerHTML = "";

    for (let m in data.machines) {
      const status = data.machines[m];
      const li = document.createElement("li");
      li.innerHTML = `${m}: <span class="${status.replace(" ", "").toLowerCase()}">${status}</span>`;
      ul.appendChild(li);
    }
  } catch (err) {
    console.error("Machine status error:", err);
  }
}

// 🕘 Laundry History
async function loadHistory() {
  try {
    const res = await fetch("/api/laundry/history", {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    const div = document.getElementById("historyList");
    div.innerHTML = "";

    data.history.forEach(s => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <p><b>${s.machine}</b> - ${s.laundryType} - ${s.itemCount} items</p>
        <p>Start: ${new Date(s.startTime).toLocaleString()}</p>
        <p>Status: <span class="${s.status.toLowerCase()}">${s.status}</span></p>
        <hr/>
      `;
      div.appendChild(item);
    });
  } catch (err) {
    console.error("History fetch error:", err);
  }
}

// 📊 Usage Statistics
async function loadStats() {
  try {
    const res = await fetch("/api/laundry/statistics", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    const stats = data.stats;
    const div = document.getElementById("stats");

    if (!stats) return (div.textContent = "No data yet");

    div.innerHTML = `
      <p>Total Sessions: <b>${stats.totalSessions}</b></p>
      <p>Total Items Washed: ${stats.totalItems}</p>
      <p>Preferred Machine: ${stats.mostUsedMachine || "N/A"}</p>
      <p><b>Type Breakdown:</b></p>
      <ul>
        ${Object.entries(stats.typeDistribution).map(
          ([type, count]) => `<li>${type}: ${count} session(s)</li>`
        ).join("")}
      </ul>
    `;
  } catch (err) {
    console.error("Stats fetch error:", err);
  }
}
