const token = localStorage.getItem("token");

// ✅ GPS Config
const hostelLocation = {
  lat: 12.88799,  // Change this to your actual hostel lat
  lng: 77.61866   // Change this to your actual hostel lng
};
const radiusMeters = 100;

// ✅ Submit outing form
document.getElementById("outingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const destination = document.getElementById("destination").value;
  const purpose = document.getElementById("purpose").value;
  const duration = document.getElementById("duration").value;

  const res = await fetch("/api/outing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ destination, purpose, duration })
  });

  const data = await res.json();
  if (data.success) {
    alert("✅ Outing submitted!");
    loadOutings();
  } else {
    alert("❌ Failed to submit outing.");
  }
});

// ✅ Load outing history & stats
async function loadOutings() {
  const res = await fetch("/api/outing", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.success) {
    const tbody = document.querySelector("#outingHistory tbody");
    tbody.innerHTML = "";

    let total = 0;
    let sumDuration = 0;
    const purposeCount = {};

    data.outings.forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.destination}</td>
        <td>${o.purpose}</td>
        <td>${new Date(o.createdAt).toLocaleString()}</td>
        <td>${o.returned ? "✅" : "❌"}</td>
      `;
      tbody.appendChild(tr);

      total++;
      sumDuration += parseFloat(o.duration);
      purposeCount[o.purpose] = (purposeCount[o.purpose] || 0) + 1;
    });

    document.getElementById("totalOutings").innerText = total;
    document.getElementById("avgDuration").innerText = total > 0 ? (sumDuration / total).toFixed(1) + "h" : "0h";

    const commonPurpose = Object.entries(purposeCount).sort((a, b) => b[1] - a[1])[0];
    document.getElementById("commonPurpose").innerText = commonPurpose ? commonPurpose[0] : "-";
  }
}
loadOutings();

// ✅ GPS checker: Show "I'm Back" button
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) ** 2 +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function checkLocationAndShowButton() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const dist = getDistanceFromLatLonInMeters(latitude, longitude, hostelLocation.lat, hostelLocation.lng);
      const btn = document.getElementById("imBackBtn");

      if (dist <= radiusMeters) {
        btn.style.display = "inline-block";
      } else {
        btn.style.display = "none";
      }
    },
    () => {
      console.warn("❌ Unable to get location.");
    }
  );
}
setInterval(checkLocationAndShowButton, 10000);

// ✅ I'm Back button click
document.getElementById("imBackBtn").addEventListener("click", async () => {
  const res = await fetch("/api/outing/return", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (data.success) {
    alert("✅ Welcome back!");
    loadOutings();
    document.getElementById("imBackBtn").style.display = "none";
  } else {
    alert("❌ Failed: " + data.message);
  }
});
