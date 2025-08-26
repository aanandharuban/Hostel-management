document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in.");
    window.location.href = "index.html";
    return;
  }

  const tableBody = document.querySelector("#complaintTable tbody");

  // Load all complaints
  try {
    const res = await fetch("/api/warden/complaints", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    if (data.success) {
      tableBody.innerHTML = "";
      data.complaints.forEach(complaint => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${complaint.studentEmail}</td>
          <td>${complaint.category}</td>
          <td>${complaint.message}</td>
          <td>${complaint.status}</td>
          <td>
            <select data-id="${complaint._id}" class="statusDropdown">
              <option ${complaint.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${complaint.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${complaint.status === "Resolved" ? "selected" : ""}>Resolved</option>
            </select>
          </td>
        `;

        tableBody.appendChild(row);
      });

      // Add change listener
      document.querySelectorAll(".statusDropdown").forEach(dropdown => {
        dropdown.addEventListener("change", async (e) => {
          const id = e.target.getAttribute("data-id");
          const newStatus = e.target.value;

          const updateRes = await fetch(`/api/warden/complaints/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
          });

          const updateData = await updateRes.json();
          if (updateData.success) {
            alert("Status updated successfully.");
          } else {
            alert("Failed to update status.");
          }
        });
      });

    } else {
      alert("Failed to load complaints: " + data.message);
    }

  } catch (err) {
    console.error("Error loading complaints:", err);
    alert("Server error.");
  }
});
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("You have been logged out.");
  window.location.href = "index.html";
});
const token = localStorage.getItem("token");

if (!token) {
  alert("Not logged in. Redirecting...");
  window.location.href = "index.html";
  return;
}
async function checkOutingNotifications() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/warden/outings", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  const newOutings = data.outings.filter(o => o.status === "Pending" && !o.notifiedWarden);
  if (newOutings.length > 0) {
    document.getElementById("outing-alert").innerText = `🔔 ${newOutings.length} new outing request(s)`;
  } else {
    document.getElementById("outing-alert").innerText = "";
  }
}

checkOutingNotifications();
