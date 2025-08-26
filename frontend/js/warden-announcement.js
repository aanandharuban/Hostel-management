document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("announcementForm");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in.");
    window.location.href = "index.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const heading = document.getElementById("heading").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!heading || !message) {
      return alert("Please fill in both heading and message.");
    }

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ heading, message })
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Announcement posted successfully!");
        form.reset();
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      console.error("Error posting announcement:", err);
      alert("❌ Server error while posting announcement.");
    }
  });
});
