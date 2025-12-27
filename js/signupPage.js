document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myForm");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    let username = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();

    let namePattern = /^[A-Za-z\s]+$/;
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}.*$/;


    if (!namePattern.test(username)) {
      alert("❗Name must contain only letters.");
      return;
    }

    if (!emailPattern.test(email)) {
      alert("❗Enter a valid email address.");
      return;
    }

    if (!passwordPattern.test(password)) {
      alert("❗Password must have 1 uppercase, 1 lowercase, 1 number & 1 special character.");
      return;
    }

    try {
      const response = await fetch("php/signUp.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      });

      const data = await response.json();
      if (data.status === "success") {
        alert(data.message);
        window.location.href = "index.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error connecting to the server.");
      console.error(error);
    }
  });
});

window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      document.getElementById("myForm").reset();
    }
  });