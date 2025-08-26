document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) return location.href = "index.html";

  // Greeting
  const res = await fetch("/api/student/profile", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById("greeting").textContent = `👋 Welcome, ${data.student.name}!`;
  }

  // Complaint count
  const compRes = await fetch("/api/complaints", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const compData = await compRes.json();
  if (compData.success) {
    document.getElementById("complaintCount").textContent = `${compData.complaints.length} filed`;
  }

  // Outing status
  const outRes = await fetch("/api/outing", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const outData = await outRes.json();
  if (outData.success) {
    const active = outData.outings.find(o => o.status !== 'Returned');
    document.getElementById("outingStatus").textContent = active ? active.status : "None";
  }
});

async function sendSOS() {
  const token = localStorage.getItem("token");
  const confirmed = confirm("Send emergency alert?");
  if (!confirmed) return;

  let location = "Not shared";
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
      submit(coords);
    }, () => submit(location));
  } else {
    submit(location);
  }

  async function submit(location) {
    const res = await fetch("/api/emergency", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ location })
    });

    const data = await res.json();
    alert(data.success ? "🚨 Alert sent!" : "❌ Failed");
  }
}

function logout() {
  localStorage.removeItem("token");
}
