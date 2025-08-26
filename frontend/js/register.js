document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const name = document.getElementById("name").value;
  const room = document.getElementById("room").value;
  const block = document.getElementById("block").value;
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value;
  const department = document.getElementById("department").value;
  const year = document.getElementById("year").value;

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, department, year, phone, room, block })
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Registration successful. You can now log in.");
      window.location.href = "index.html";
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("Something went wrong.");
  }
});
