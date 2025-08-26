document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "student") {
    alert("Unauthorized access.");
    window.location.href = "index.html";
    return;
  }

  const modal = document.getElementById("complaintModal");
  const openModalBtn = document.getElementById("openModalBtn");
  const form = document.getElementById("complaintForm");
  const complaintList = document.getElementById("complaintList");

  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  document.querySelector(".cancel-btn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value.trim();

    if (!title || !category || !description) {
      alert("❌ All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, category, description }),
      });

      const data = await res.json();

      if (data.success) {
        alert("✅ Complaint submitted successfully.");
        form.reset();
        modal.style.display = "none";
        await loadComplaints();  // 👈 Refresh list immediately after
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("❌ Failed to submit complaint.");
    }
  });

  async function loadComplaints() {
    try {
      const res = await fetch("/api/complaints/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        complaintList.innerHTML = ""; // ✅ Clear previous to prevent duplicates

        data.complaints.forEach((c) => {
          const card = document.createElement("div");
          card.className = "complaint-card";
          card.innerHTML = `
            <h3>${c.title}</h3>
            <small>Category: ${c.category}</small>
            <p>${c.description}</p>
            <small>Submitted on: ${new Date(c.createdAt).toLocaleDateString()}</small>
            <span class="status-tag status-${c.status.toLowerCase()}">${c.status}</span>
          `;
          complaintList.appendChild(card);
        });
      } else {
        complaintList.innerHTML = "<p>No complaints found.</p>";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      complaintList.innerHTML = "<p>Error loading complaints.</p>";
    }
  }

  // ✅ Always call on page load
  loadComplaints();
});
