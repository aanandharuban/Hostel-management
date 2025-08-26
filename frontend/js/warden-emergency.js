document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "warden") {
    alert("Unauthorized access");
    window.location.href = "index.html";
    return;
  }

  const tableBody = document.getElementById("emergencyTableBody");

  try {
    const res = await fetch("/api/warden/emergencies", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!data.success) {
      alert("❌ Failed to fetch emergencies");
      return;
    }

    const emergencies = data.emergencies;

    for (let i = 0; i < emergencies.length; i++) {
      const em = emergencies[i];

      // 🔍 Fetch student details for each email (optional: cache for optimization)
      const stuRes = await fetch(`/api/student/by-email/${em.studentEmail}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const stuData = await stuRes.json();
      const student = stuData.student || {};

      const row = `
        <tr>
          <td>${i + 1}</td>
          <td>${student.name || "N/A"}</td>
          <td>${em.studentEmail}</td>
          <td>${student.room || "N/A"}</td>
          <td><span class="status-tag">${em.type || "General"}</span></td>
          <td>${em.desc || "No description"}</td>
          <td><span class="timestamp">${new Date(em.timestamp).toLocaleString()}</span></td>
        </tr>
      `;

      tableBody.innerHTML += row;
    }
  } catch (err) {
    console.error("Emergency fetch error:", err);
    alert("❌ Server error");
  }
});
