document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in");
    return (window.location.href = "index.html");
  }

  try {
       const res = await fetch("/api/announcements", {
       headers: {
           Authorization: `Bearer ${token}`
        }
    });;

    const data = await res.json();

    const list = document.getElementById("announcementList");
    list.innerHTML = "";

    if (data.success && data.announcements.length > 0) {
      data.announcements.forEach((a) => {
        const div = document.createElement("div");
        div.classList.add("announcement-card");
        div.innerHTML = `
          <h3>${a.heading}</h3>
          <p>${a.message}</p>
          <small>${new Date(a.createdAt).toLocaleString()}</small>
          <hr/>
        `;
        list.appendChild(div);
      });
    } else {
      list.innerHTML = "<p>No announcements found.</p>";
    }
  } catch (err) {
    console.error("Error loading announcements:", err);
    alert("Failed to load announcements.");
  }
});
