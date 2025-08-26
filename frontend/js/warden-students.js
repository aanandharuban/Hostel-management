document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "warden") {
    alert("Unauthorized access");
    window.location.href = "index.html";
    return;
  }

  let studentsData = [];

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/warden/students", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        studentsData = data.students;
        renderStudents(studentsData);
      } else {
        alert("❌ Failed to load students: " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("❌ Server error");
    }
  };

  const renderStudents = (students) => {
    const tableBody = document.getElementById("studentTableBody");
    tableBody.innerHTML = "";

    students.forEach((student, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.room}</td>
          <td>${student.block}</td>
          <td>${student.department || "N/A"}</td>
          <td>${student.year || "N/A"}</td>
          <td>${student.phone || "N/A"}</td>
          <td><button class="delete-btn" data-id="${student._id}">Delete</button></td>
        </tr>`;
      tableBody.innerHTML += row;
    });

    // Attach delete event to all buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        if (confirm("Are you sure you want to delete this student?")) {
          try {
            const res = await fetch(`/api/warden/students/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            const result = await res.json();
            if (result.success) {
              alert("✅ Student deleted");
              fetchStudents(); // refresh
            } else {
              alert("❌ Failed to delete student");
            }
          } catch (err) {
            console.error("Delete error:", err);
            alert("❌ Server error");
          }
        }
      });
    });
  };

  // Search functionality
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = studentsData.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
    );
    renderStudents(filtered);
  });

  fetchStudents();
});
