document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "warden") {
    alert("Unauthorized access");
    window.location.href = "index.html";
    return;
  }

  try {
    const res = await fetch("/api/warden/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById("name").value = data.warden.name || "";
      document.getElementById("email").value = data.warden.email || "";
      document.getElementById("phone").value = data.warden.phone || "";
      document.getElementById("block").value = data.warden.block || "";
    } else {
      alert("Failed to load profile.");
    }
  } catch (err) {
    console.error("Error fetching profile:", err);
    alert("Server error while loading profile.");
  }
});

document.getElementById("editBtn").addEventListener("click", () => {
  document.getElementById("name").disabled = false;
  document.getElementById("phone").disabled = false;
  document.getElementById("block").disabled = false;
  document.getElementById("saveBtn").style.display = "inline-block";
});

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const block = document.getElementById("block").value;

  try {
    const res = await fetch("/api/warden/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, phone, block }),
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Profile updated successfully!");
      location.reload();
    } else {
      alert("❌ Update failed: " + data.message);
    }
  } catch (err) {
    alert("❌ Server error while updating profile.");
    console.error(err);
  }
});
