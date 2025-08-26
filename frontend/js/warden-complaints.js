document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "warden") {
    alert("Unauthorized access");
    window.location.href = "index.html";
    return;
  }

  const tableBody = document.getElementById("complaintTableBody");
  const modal = document.getElementById("statusModal");
  const statusSelect = document.getElementById("statusSelect");
  const saveBtn = document.getElementById("saveStatusBtn");
  const closeModal = document.querySelector(".close");

  let selectedComplaintId = null;

  // 🔄 Fetch and render complaints
  async function fetchComplaints() {
    try {
      const res = await fetch("/api/warden/complaints", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        renderTable(data.complaints);
      } else {
        alert("❌ Failed to load complaints");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Server error");
    }
  }

  // 🧾 Render complaint table
  function renderTable(complaints) {
    tableBody.innerHTML = "";

    complaints.forEach((complaint, index) => {
  const row = `
    <tr>
      <td>${index + 1}</td>
      <td>${complaint.studentId?.name || "N/A"}</td>
      <td>${complaint.studentId?.email || "N/A"}</td>
      <td>${complaint.title}</td>
      <td>${complaint.description}</td>
      <td>${complaint.category}</td>
      <td>${complaint.status}</td>
      <td>
        <button class="update-btn" data-id="${complaint._id}" data-status="${complaint.status}">
          Update
        </button>
      </td>
    </tr>`;
  tableBody.innerHTML += row;
});


    // Attach update event
    document.querySelectorAll(".update-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedComplaintId = btn.dataset.id;
        statusSelect.value = btn.dataset.status;
        modal.style.display = "block";
      });
    });
  }

  // 💾 Save status update
  saveBtn.addEventListener("click", async () => {
    const newStatus = statusSelect.value;

    try {
      const res = await fetch(`/api/warden/complaints/${selectedComplaintId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (result.success) {
        alert("✅ Status updated");
        modal.style.display = "none";
        fetchComplaints(); // refresh table
      } else {
        alert("❌ Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Server error");
    }
  });

  // ❌ Close modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // 📦 Initial fetch
  fetchComplaints();
});
