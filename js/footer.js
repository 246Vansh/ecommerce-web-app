document.addEventListener("DOMContentLoaded", function () {
    fetch("footer.html", { cache: "no-store" })
        .then(response => response.text())
        .then(data => {
            document.getElementById("footer-placeholder").innerHTML = data;

            document.querySelectorAll(".footer-toggle").forEach(button => {
                button.addEventListener("click", () => {
                    const section = button.closest(".footer-section");
                    const list = section.querySelector(".footer-links");

                    list.classList.toggle("collapsed");

                    const icon = button.querySelector("i");
                    icon.classList.toggle("fa-chevron-down");
                    icon.classList.toggle("fa-chevron-up");
                });
            });
        })
        .catch(error => console.error("Error loading footer:", error));
});
