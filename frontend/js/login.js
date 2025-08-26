const studentBtn = document.getElementById("studentBtn");
const wardenBtn = document.getElementById("wardenBtn");
const loginForm = document.getElementById("loginForm");

let currentRole = "student"; // Default

studentBtn.addEventListener("click", () => {
  currentRole = "student";
  studentBtn.classList.add("active");
  wardenBtn.classList.remove("active");
});

wardenBtn.addEventListener("click", () => {
  currentRole = "warden";
  wardenBtn.classList.add("active");
  studentBtn.classList.remove("active");
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginForm.querySelector("input[type=email]").value.trim();
  const password = loginForm.querySelector("input[type=password]").value;

  const endpoint = "/api/login";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: currentRole }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", currentRole);
      if (currentRole === "warden") {
        localStorage.setItem("wardenName", data.name);
        window.location.href = "warden-dashboard.html";
      } else {
        window.location.href = "overview.html";
      }
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    alert("❌ Server error");
    console.error(err);
  }
});
