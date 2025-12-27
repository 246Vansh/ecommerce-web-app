const subTotal = document.querySelector("#subTotal strong");
const shippingTax = document.querySelector("#shippingTax strong");
const productTax = document.querySelector("#productTax strong");
const totalBill = document.querySelector("#totalBill strong");

let userId = null;


document.addEventListener("DOMContentLoaded", async () => {
    await fetchUserId();
    await cartBill();
    await loadCartProducts();
});

async function fetchUserId() {
    try {
        const res = await fetch("php/getUser.php", { credentials: "include" });
        const data = await res.json();
        if (data.status === "success") {
            userId = data.user_id;
        } else {
            userId = null;
        }
    } catch (error) {
        console.error("❌ Error fetching user ID:", error);
    }
}

async function cartBill() {
    const storedProducts = await getCartProducts();

    let subtotalAmount = storedProducts.reduce((sum, product) =>
        sum + (product.price * (product.quantity || 1)), 0
    );

    subTotal.textContent = `$${subtotalAmount.toFixed(2)}`;

    let shippingAmount = subtotalAmount > 100 ? 0 : (subtotalAmount > 0 ? 5 : 0);
    shippingTax.textContent = `$${shippingAmount.toFixed(2)}`;

    let taxAmount = (subtotalAmount * 5) / 100;
    productTax.textContent = `$${taxAmount.toFixed(2)}`;

    let totalAmount = subtotalAmount + shippingAmount + taxAmount;
    totalBill.textContent = `$${totalAmount.toFixed(2)}`;
}


document.querySelector(".checkout-button")?.addEventListener("click", async () => {
    if (!userId) { // <-- use correct variable
        alert("❗ Please log in or sign up to proceed to checkout.");
        return;
    }

    const cartItems = await getCartProducts();
    if (!cartItems.length) {
        alert("❗ Your cart is empty!");
        return;
    }

    window.location.href = "checkoutPage.html";
});


// --- Cart Functions ---
async function getCartPageProducts() {
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

    const storedProducts = await getCartProducts();
    productContainer.innerHTML = "";

    if (storedProducts.length === 0) {
        await updateCartCount();
        await cartBill();
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
            <select class="quantitySelector" data-product-id="${product.product_id}">
                ${[...Array(10).keys()].map(i =>
                    `<option value="${i + 1}" ${product.quantity == i + 1 ? "selected" : ""}>${i + 1}</option>`
                ).join("")}
            </select>
            <button type="button" class="remove-btn" data-product-id="${product.product_id}">
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

    cartBill();
}


async function addToCart(productId, quantity = 1) {
    try {
        const res = await fetch("php/cart/addToCart.php", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        const data = await res.json();
        if (data.status === "success") {
            alert("✅ Product Added To Cart");
            await loadCartProducts();
        }
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
    }
}

async function updateCartPageQuantity(productId, quantity) {
    try {
        const res = await fetch("php/cart/updateCart.php", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        await res.json();
        await loadCartProducts();
    } catch (error) {
        console.error("❌ Error updating quantity:", error);
    }
}

async function deleteProduct(productId) {
    try {
        const res = await fetch("php/cart/deleteCart.php", {
            method: "POST",
            headers: {"Content-Type": "application/x-www-form-urlencoded"},
            body: `user_id=${userId}&product_id=${productId}`
        });
        await res.json();
        await updateCartCount();
        await loadCartProducts();
    } catch (error) {
        console.error("❌ Error deleting product:", error);
    }
}

async function updateCartCount() {
    const cartItemNo = document.querySelector(".cartNumber");
    const cartProducts = await getCartProducts();
    const cartCount = cartProducts.reduce((total, item) => total + item.quantity, 0);
    if (cartItemNo) cartItemNo.textContent = cartCount;
}
