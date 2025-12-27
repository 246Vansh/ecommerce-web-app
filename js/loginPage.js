document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch("php/login.php", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.json();
      console.log(data)

      if (data.status === "success") {
        alert(data.message);
        window.location.href = "index.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error connecting to server!");
      console.error(error);
    }
  });
});

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      document.getElementById("myForm").reset();
    }
  });