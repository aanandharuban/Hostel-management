document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Not logged in. Redirecting...");
    window.location.href = "index.html";
    return;
  }

  await fetchOutingRequests();

  // 🔁 Add event listeners for dropdowns after data loads
  document.querySelectorAll(".status-dropdown").forEach(dropdown => {
    dropdown.addEventListener("change", async (e) => {
      const id = e.target.getAttribute("data-id");
      const newStatus = e.target.value;

      try {
        const res = await fetch(`/api/warden/outings/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        });

        const result = await res.json();
        if (result.success) {
          alert("✅ Status updated.");
          window.location.reload();
        } else {
          alert("❌ Failed to update.");
        }
      } catch (err) {
        console.error("Status update failed", err);
        alert("❌ Server error.");
      }
    });
  });
});

async function fetchOutingRequests() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("/api/warden/outings", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const tbody = document.getElementById("outingTableBody") || document.querySelector("#outingTable tbody");
    tbody.innerHTML = "";

    if (data.success) {
      data.outings.forEach((o) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${o.studentName || "-"}</td>
          <td>${o.destination || "-"}</td>
          <td>${o.purpose || "-"}</td>
          <td>${o.duration || "-"}</td>
          <td>${o.status}</td>
          <td>
            ${o.status === "Pending" ? `
              <select data-id="${o._id}" class="status-dropdown">
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            ` : "—"}
          </td>
        `;

        tbody.appendChild(tr);
      });
    } else {
      alert("❌ Failed to fetch outing requests.");
    }

  } catch (err) {
    console.error("❌ Error loading outings:", err);
    alert("Server error.");
  }
}

// ✅ Optional logout handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "index.html";
  });
}
