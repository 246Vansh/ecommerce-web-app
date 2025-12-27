window.userId = null;

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const headerHTML = await fetch("header.html").then(res => res.text());
        document.getElementById("header-placeholder").innerHTML = headerHTML;


        const userMenuBtn = document.getElementById("userMenuBtn");
        const dropdownMenu = document.getElementById("dropdownMenu");

        // Toggle dropdown visibility
        userMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("show");
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", () => {
            dropdownMenu.classList.remove("show");
        });

        userId = await updateUserHeader();
        userLogout();
        toggleSearchBar();
        initSearchInput();
        if (!userId) {
            alert("⚠️ No user logged in — cart will not load");
            return;
        }

        await updateCartCount();

        if (document.querySelector(".cart-items")) {
            await loadCartProducts();
        }

        if (document.querySelector(".productContainer")) {
            await loadCheckoutProducts();
        }

    } catch (error) {
        console.error("❌ Error loading header:", error);
    }
});

async function getCartProducts() {
    try {
        const res = await fetch(`php/cart/getCart.php?user_id=${userId}`);
        const data = await res.json();
        return data.cart || [];
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
        return [];
    }
}

async function loadCartProducts() {
    const productContainer = document.querySelector(".cart-items");
    if (!productContainer) return;
    let storedProducts = await getCartProducts();
    productContainer.innerHTML = "";

    if (storedProducts.length === 0) {
        await updateCartCount();
        if (typeof cartBill === "function") cartBill();
        return;
    }

    storedProducts.forEach((product, index) => {
        const cartProduct = document.createElement("div");
        cartProduct.classList.add("cartItem");
        cartProduct.innerHTML = `
            <img class="productImage" src="${product.images[0]}" loading="lazy">
            <div class="productInfo">
                <p class="productTitle">${product.title}</p>
                <p class="productPrice"><strong>Price:</strong> $${product.price}</p>
            </div>
            <select class="quantitySelector" data-index="${index}">
                ${[...Array(10).keys()].map(i =>
            `<option value="${i + 1}" ${product.quantity == i + 1 ? "selected" : ""}>${i + 1}</option>`
        ).join("")}
            </select>
            <button type="button" class="remove-btn" data-index="${index}">
                <span class="sr-only">Remove</span>
                <svg class="removeIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </button>
        `;
        productContainer.appendChild(cartProduct);
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const productId = e.currentTarget.dataset.productId;
            await deleteProduct(productId);
        });
    });

    document.querySelectorAll(".quantitySelector").forEach(selector => {
        selector.addEventListener("change", async (e) => {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value, 10);
            await updateQuantity(productId, quantity);
        });
    });

    if (storedProducts.length > 0 && typeof cartBill === "function") cartBill();
}

async function loadCheckoutProducts() {
    const productContainer = document.querySelector(".productContainer");
    if (!productContainer) return;
    let storedProducts = await getCartProducts();
    productContainer.innerHTML = "";

    if (storedProducts.length === 0) {
        await updateCartCount();
        if (typeof cartBill === "function") cartBill();
        return;
    }

    storedProducts.forEach((product, index) => {
        const checkoutProduct = document.createElement("div");
        checkoutProduct.classList.add("checkoutItem");

        checkoutProduct.innerHTML = `
            <img class="productImage" src="${product.images[0]}" loading="lazy">
            <div class="productInfoBlock">
                <div class="productDetails">
                    <p class="productTitle">${product.title}</p>
                    <p class="productPrice"><strong>Price:</strong> $${product.price}</p>
                </div>
                <div class="productControls">
                    <select class="quantitySelector" data-index="${index}">
                        ${[...Array(10).keys()].map(i =>
            `<option value="${i + 1}" ${product.quantity == i + 1 ? "selected" : ""}>${i + 1}</option>`
        ).join("")}
                    </select>
                    <button type="button" class="remove-btn" aria-label="Remove" data-index="${index}">
                        <svg class="removeIcon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        productContainer.appendChild(checkoutProduct);
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const productId = e.currentTarget.dataset.productId;
            await deleteProduct(productId);
        });
    });

    document.querySelectorAll(".quantitySelector").forEach(selector => {
        selector.addEventListener("change", async (e) => {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value, 10);
            await updateQuantity(productId, quantity);
        });
    });

    if (storedProducts.length > 0 && typeof cartBill === "function") cartBill();
}


async function addToCart(productId, quantity = 1) {
    try {
        const res = await fetch("php/cart/addToCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        const data = await res.json();
        if (data.status === "success") await loadCartProducts();
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

async function updateQuantity(productId, quantity) {
    try {
        const res = await fetch("php/cart/updateCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        const data = await res.json();

        if (data.status === "success") {
            await loadCartProducts();
            await updateCartCount();
            if (typeof cartBill === "function") cartBill();
        } else {
            console.warn("⚠️ Update failed:", data.message);
        }
    } catch (error) {
        console.error("❌ Error updating quantity:", error);
    }
}


async function deleteProduct(productId) {
    try {
        const res = await fetch("php/cart/deleteCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&product_id=${productId}`
        });
        const data = await res.json();
        console.log(data.message);
        await updateCartCount();
        await loadCartProducts();
        if (typeof cartBill === "function") cartBill();
    } catch (error) {
        console.error("❌ Error deleting product:", error);
    }
}

async function updateCartCount() {
    try {
        const cartItemNo = document.querySelector(".cartNumber");
        const cartProducts = await getCartProducts();

        const cartCount = Array.isArray(cartProducts)
            ? cartProducts.reduce((total, item) => total + (item.quantity || 0), 0)
            : 0;

        if (cartItemNo) {
            cartItemNo.textContent = cartCount;
        }

    } catch (error) {
        console.error("❌ Error updating cart count:", error);
    }
}


async function cartProduct(title, price, images) {
    let cartItems = await getCartProducts();
    let existingProduct = cartItems.find(item => item.title === title);
    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        const newProduct = { title, price, images, quantity: 1 };
        cartItems.push(newProduct);
    }
    await updateCartCount();
    alert("✅ Product Added To Cart");
    window.location.href = 'cartPage.html';
    if (typeof cartBill === "function") cartBill();
}

async function updateUserHeader() {
    const authLinks = document.querySelector(".auth-links");
    const circle = document.querySelector(".circle");
    const loginCircle = document.querySelector(".circle-text");

    try {
        const response = await fetch("php/getUser.php", {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (data.loggedIn && data.user) {
            window.userId = data.user.id;
            const username = data.user.username || "user";
            const nameParts = username.trim().split(" ");
            const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
            const lastInitial = nameParts.length > 1 ? nameParts[1].charAt(0).toUpperCase() : "";
            const userInitials = firstInitial + lastInitial;

            if (loginCircle) {
                loginCircle.innerHTML = userInitials;
                circle.style.display = "flex";
            }

            if (authLinks) authLinks.style.display = "none";
            return window.userId;
        } else {
            resetHeaderUI(authLinks, circle);
            window.userId = null;
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        resetHeaderUI(authLinks, circle);
        window.userId = null;
        return null;
    }
}

function resetHeaderUI(authLinks, circle) {
    if (authLinks) authLinks.style.display = "block";
    if (circle) circle.style.display = "none";
}

async function userLogout() {
    const btn = document.getElementById("logout");

    if (btn) {
        btn.addEventListener("click", async (e) => {
            e.preventDefault();

            try {
                const response = await fetch("php/logout.php", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();

                if (data.status === "success") {
                    alert(data.message);
                    resetHeaderUI(
                        document.querySelector(".auth-links"),
                        document.querySelector(".circle")
                    );
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
                else if (data.status === "not_logged_in") {
                    alert("Please log in or sign up first.");
                }
                else {
                    alert("Logout failed. Please try again.");
                }
            } catch (error) {
                console.error("❌ Logout error:", error);
                alert("Error connecting to server!");
            }
        });
    }
}

function toggleSearchBar() {
    const searchBarContainer = document.querySelector(".search-bar-container");
    const mic = document.querySelector(".mic");

    if (mic && searchBarContainer) {
        mic.addEventListener("click", () => {
            searchBarContainer.classList.toggle("active");
        });
    } else {
        console.error("❌ Mic or search bar container not found.");
    }
}

function initSearchInput() {
    const searchInput = document.querySelector(".input");
    if (!searchInput) {
        console.error("❌ Search input not found.");
        return;
    }

    let debounceTimeout = null;

    searchInput.addEventListener("input", (event) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            let searchQuery = event.target.value.trim().toLowerCase();
            isSearching = searchQuery !== "";
            filteredProducts = isSearching
                ? allProducts.filter(product =>
                    product.title.toLowerCase().includes(searchQuery)
                )
                : [...allProducts];
            totalProducts = filteredProducts.length;
            totalPages = Math.ceil(totalProducts / itemsPerPage);
            currentPage = 1;
            renderProducts(getPaginatedProducts());
            generatePagination();
        }, 300);
    });
}
