document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        if (!sessionStorage.getItem("banner")) {
            document.querySelector(".cookie-banner").classList.add("show");
        }
    }, 500);
});

document.addEventListener("click", (event) => {
    const cookieBanner = document.querySelector(".cookie-banner");

    if (!cookieBanner) return;

    if (event.target.classList.contains("accept-button") || event.target.classList.contains("reject-button")) {
        sessionStorage.setItem("banner", "true"); // just a flag to remember user's choice
        cookieBanner.remove();
    }
});


const featureParagraph = `
We're committed to responsible, sustainable, and ethical manufacturing.
Our small-scale approach allows us to focus on quality and reduce our impact.
We're doing our best to delay the inevitable heat-death of the universe.`;

let index = 0;

function generateText() {
    if (index < featureParagraph.length) {
        const featurePara = document.querySelector(".feature-para");
        const span = document.createElement("span");
        span.innerText = featureParagraph[index];
        span.style.opacity = "0";
        span.style.transition = "opacity 0.3s ease-in-out";

        featurePara.appendChild(span);
        setTimeout(() => span.style.opacity = "1", 50);

        index++;
        setTimeout(generateText, featureParagraph[index] === " " ? 100 : 50);
    }
}
window.onload = function () {
    document.querySelector(".feature-para").innerText = "";
    generateText();
};
