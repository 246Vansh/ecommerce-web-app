document.addEventListener("DOMContentLoaded", async () => {
    document.querySelectorAll(".toggle-btn").forEach(button => {
        button.addEventListener("click", () => {
            const list = document.getElementById(button.getAttribute("aria-controls"));
            const plusIcon = button.querySelector("#plusIcon");
            const minusIcon = button.querySelector("#minusIcon");

            document.querySelectorAll(".feature-list").forEach(sec => {
                if (sec !== list) sec.classList.add("hidden");
            });
            document.querySelectorAll(".toggle-btn").forEach(btn => {
                const plus = btn.querySelector("#plusIcon");
                const minus = btn.querySelector("#minusIcon");
                if (plus) plus.classList.remove("hidden");
                if (minus) minus.classList.add("hidden");
            });

            list.classList.toggle("hidden");
            if (plusIcon && minusIcon) {
                plusIcon.classList.toggle("hidden", !list.classList.contains("hidden"));
                minusIcon.classList.toggle("hidden", list.classList.contains("hidden"));
            }
        });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
        console.error("No product ID provided!");
        return;
    }
    const response = await fetch(`php/productDetailsPage.php?id=${productId}`);
    const result = await response.json();

    if (result.status === "success" && result.data) {
        const product = result.data;

        const image = (Array.isArray(product.image) && product.image.length > 0)
            ? product.image
            : [product.image];

        const mainImageEl = document.getElementById("main-image");
        if (mainImageEl) {
            mainImageEl.src = image[0];
            mainImageEl.classList.add("lazy-loading");

        } else {
            console.error("Product not found or error in fetching:", result.message);
        }

        const thumbnailContainer = document.querySelector(".multipleImage");

        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = "";

            if (image.length > 1) {
                image.forEach((imgSrc) => {
                    const label = document.createElement("label");
                    label.classList.add("image-thumbnails", "lazy-load");

                    label.addEventListener("click", () => {
                        document.querySelectorAll(".image-thumbnails").forEach(thumb => {
                            thumb.classList.remove("active");
                        });

                        label.classList.add("active");
                        changeImage(imgSrc);
                    });

                    const thumbImg = document.createElement("img");
                    thumbImg.src = imgSrc;
                    label.appendChild(thumbImg);

                    thumbnailContainer.appendChild(label);
                });
            } else {
                thumbnailContainer.style.display = "none";
            }
        }

        const productTitleEl = document.getElementById("productTitle");
        if (productTitleEl) productTitleEl.textContent = product.title;
        const productPriceEl = document.getElementById("productPrice");
        if (productPriceEl) productPriceEl.textContent = `$${product.price}`;
        const productDescriptionEl = document.getElementById("productDescription");
        if (productDescriptionEl) productDescriptionEl.textContent = product.description;
        const productReviewsEl = document.getElementById("productReviews");
        if (productReviewsEl) productReviewsEl.innerHTML = generateRatingStars(product.rating);

        const cartBtn = document.querySelector(".add-to-bag");
        cartBtn.addEventListener("click", async () => {
            await addToCartBackend(product.id);
        });
    }
});

async function addToCartBackend(productId, quantity = 1) {
    try {
        const res = await fetch("php/cart/addToCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        const data = await res.json();
        if (data.status === "success") {
            alert("✅ Product Added To Cart");
            await updateCartCount();
            window.location.href = "cartPage.html";
        } else {
            alert(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

function changeImage(src) {
    const mainImageEl = document.getElementById("main-image");
    if (mainImageEl) {
        mainImageEl.src = src;
    }
}

function generateRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = (rating % 1 >= 0.5) ? 1 : 0;
    const emptyStars = 5 - (fullStars + halfStar);
    return (
        "★".repeat(fullStars).replace(/★/g, '<span class="star filled">★</span>') +
        "★".repeat(halfStar).replace(/★/g, '<span class="star filled">★</span>') +
        "★".repeat(emptyStars).replace(/★/g, '<span class="star">★</span>')
    );
}