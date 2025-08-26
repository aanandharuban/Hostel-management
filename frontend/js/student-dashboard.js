document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in. Redirecting...");
    window.location.href = "index.html";
    return;
  }

  // ==== Load Profile ====
  try {
    const res = await fetch("/api/student/profile", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (data.success) {
      const student = data.student;
      document.querySelector(".profile").innerHTML = `
        <h2>👤 Profile</h2>
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Email:</strong> ${student.email}</p>
        <p><strong>Room:</strong> ${student.room}</p>
        <p><strong>Block:</strong> ${student.block}</p>
        <p><strong>Phone Number:</strong> ${student.phone}</p>
      `;
    } else {
      alert("Failed to load profile.");
    }
  } catch (err) {
    console.error("Profile load error:", err);
    alert("Server error while loading profile.");
  }

  // ==== Complaint Form Submission ====
  const complaintForm = document.getElementById("complaintForm");
  const complaintList = document.getElementById("complaintList");

  complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const category = document.getElementById("category").value;
    const message = complaintForm.querySelector("textarea").value.trim();

    if (!category || !message) return;

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category, message })
      });

      const data = await res.json();
      if (data.success) {
        complaintForm.reset();
        loadComplaints();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Complaint submission error:", err);
    }
  });

  async function loadComplaints() {
    try {
      const res = await fetch("/api/complaints", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        complaintList.innerHTML = "";
        data.complaints.forEach(c => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${c.category}</strong>: ${c.message} — <span class="status">${c.status}</span>`;
          complaintList.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Error loading complaints:", err);
    }
  }

  loadComplaints();

  // ==== Outing Form Submission ====
  const outingForm = document.getElementById("outingForm");
  const outingList = document.getElementById("outingList");

  outingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reason = document.getElementById("reason").value;
    const outDate = document.getElementById("outDate").value;
    const returnDate = document.getElementById("returnDate").value;

    if (!reason || !outDate || !returnDate) return;

    try {
      const res = await fetch("/api/outing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason, outDate, returnDate })
      });

      const data = await res.json();
      if (data.success) {
        outingForm.reset();
        loadOutings();
        checkReturnEligibility();
      } else {
        alert("Failed to submit outing request");
      }
    } catch (err) {
      console.error("Outing request error:", err);
    }
  });

  async function loadOutings() {
    try {
      const res = await fetch("/api/outing", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        outingList.innerHTML = "";
        data.outings.forEach(o => {
          const li = document.createElement("li");
          li.innerHTML = `<strong>${o.outDate.slice(0, 10)} to ${o.returnDate.slice(0, 10)}</strong> — ${o.reason} — <span class="status">${o.status}</span>`;
          outingList.appendChild(li);
        });
      }
    } catch (err) {
      console.error("Outing history error:", err);
    }
  }

  loadOutings();
  checkReturnEligibility();

  async function checkReturnEligibility() {
    const res = await fetch("/api/outing", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!data.success) return;

    const active = data.outings.find(o => o.status === "Approved");

    if (active) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const hostelLat = 13.0827;
          const hostelLng = 80.2707;

          const distance = Math.sqrt(Math.pow(lat - hostelLat, 2) + Math.pow(lng - hostelLng, 2));

          if (distance < 0.01) {
            document.getElementById("returnButton").style.display = "inline-block";
          }
        });
      }
    }
  }

  document.getElementById("returnButton").addEventListener("click", async () => {
    const res = await fetch("/api/outing/return", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Welcome back! Your outing is marked as returned.");
      document.getElementById("returnButton").style.display = "none";
      loadOutings();
    } else {
      alert("❌ Error: " + data.message);
    }
  });

  // ==== SOS Button ====
  document.getElementById("sosButton").addEventListener("click", async () => {
    const confirmed = confirm("Are you sure you want to send an emergency alert?");
    if (!confirmed) return;

    let location = "Not shared";

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        sendSOS(coords);
      }, err => {
        sendSOS(location);
      });
    } else {
      sendSOS(location);
    }

    async function sendSOS(location) {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ location })
      });

      const data = await res.json();
      if (data.success) {
        alert("🚨 Emergency alert sent to warden.");
      } else {
        alert("❌ Failed to send alert.");
      }
    }
  });
});
