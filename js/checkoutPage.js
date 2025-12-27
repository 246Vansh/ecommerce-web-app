const subTotal = document.querySelector("#subTotal strong");
const shippingTax = document.querySelector("#shippingTax strong");
const productTax = document.querySelector("#productTax strong");
const totalBill = document.querySelector("#totalBill strong");

const fastDelivery = document.querySelector(".optionTwo");
const standardDelivery = document.querySelector(".option");

let useExpressShipping = false;

async function getCartProducts() {
    try {
        if (!userId) return [];
        const res = await fetch(`php/cart/getCart.php?user_id=${userId}`);
        const data = await res.json();
        return data.cart || [];
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
        return [];
    }
}

// --------------- CART BILL ----------------
async function cartBill() {
    const storedProducts = await getCartProducts();
    const subtotalAmount = storedProducts.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
    subTotal.textContent = `$${subtotalAmount.toFixed(2)}`;

    const shippingAmount = useExpressShipping
        ? 16
        : subtotalAmount > 100 ? 0 : (subtotalAmount > 0 ? 5 : 0);
    shippingTax.textContent = `$${shippingAmount.toFixed(2)}`;

    const taxAmount = (subtotalAmount * 5) / 100;
    productTax.textContent = `$${taxAmount.toFixed(2)}`;

    const totalAmount = subtotalAmount + shippingAmount + taxAmount;
    totalBill.textContent = `$${totalAmount.toFixed(2)}`;
}

// --------------- LOAD CHECKOUT PRODUCTS ----------------
async function loadCheckoutProducts() {
    const productContainer = document.querySelector(".productContainer");
    if (!productContainer) return;

    const products = await getCartProducts();

    if (!products.length) {
        alert("❗ Your cart is empty!");
        window.location.href = "cartPage.html";
        return;
    }

    productContainer.innerHTML = "";
    products.forEach((product, index) => {
        const div = document.createElement("div");
        div.classList.add("checkoutItem");
        div.innerHTML = `
            <img class="productImage" src="${product.images[0]}" loading="lazy">
            <div class="productInfoBlock">
                <div class="productDetails">
                    <p class="productTitle">${product.title}</p>
                    <p class="productPrice"><strong>Price:</strong> $${product.price}</p>
                </div>
                <div class="productControls">
                    <select class="quantitySelector" data-product-id="${product.product_id}">
                        ${[...Array(10).keys()].map(i =>
            `<option value="${i + 1}" ${product.quantity == i + 1 ? "selected" : ""}>${i + 1}</option>`
        ).join("")}
                    </select>
                    <button type="button" class="remove-btn" data-product-id="${product.product_id}">Remove</button>
                </div>
            </div>
        `;
        productContainer.appendChild(div);
    });

    // Event listeners
    document.querySelectorAll(".quantitySelector").forEach(selector => {
        selector.addEventListener("change", async (e) => {
            const productId = e.target.dataset.productId;
            const quantity = parseInt(e.target.value, 10);
            await updateQuantity(productId, quantity);
            await loadCheckoutProducts(); // refresh
        });
    });

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const productId = e.target.dataset.productId;
            await deleteProduct(productId);
            await loadCheckoutProducts(); // refresh
        });
    });

    await cartBill();
}

// --------------- UPDATE QUANTITY ----------------
async function updateCheckoutPageQuantity(productId, quantity) {
    try {
        const res = await fetch("php/cart/updateCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
        });
        await res.json();
        await loadCartProducts();
    } catch (error) {
        console.error("❌ Error updating quantity:", error);
    }
}


// --------------- DELETE PRODUCT ----------------
async function deleteProduct(productId) {
    try {
        const res = await fetch("php/cart/deleteCart.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
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


// --------------- USER DETAILS & ORDER ----------------
function userDetails() {
    const requiredFields = [
        "email", "firstName", "lastName", "company", "address", "apartment",
        "city", "state", "postalCode", "phone", "cardNumber",
        "cardName", "expirationDate", "cvc"
    ];

    let allFilled = true;
    let errorMessages = [];

    requiredFields.forEach(id => {
        const field = document.getElementById(id);
        const value = field?.value.trim() || "";

        // Check empty
        if (!value) {
            allFilled = false;
            field?.classList.add("input-error");
            errorMessages.push(`${id} is required`);
            return;
        } else {
            field.classList.remove("input-error");
        }

        // Specific validations
        if (id === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("Invalid email format");
            }
        }

        if (id === "postalCode") {
            if (!/^\d{5,6}$/.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("Postal code should be 5-6 digits");
            }
        }

        if (id === "phone") {
            if (!/^\d{10}$/.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("Phone number should be 10 digits");
            }
        }

        if (id === "cardNumber") {
            if (!/^\d{16}$/.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("Card number must be 16 digits");
            }
        }

        if (id === "cvc") {
            if (!/^\d{3}$/.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("CVC must be 3 digits");
            }
        }

        if (id === "expirationDate") {
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                allFilled = false;
                field.classList.add("input-error");
                errorMessages.push("Expiration date must be in MM/YY format");
            }
        }
    });

    if (!allFilled) {
        alert("❗ Please correct the following errors:\n" + errorMessages.join("\n"));
        return false;
    }

    return true;
}

document.querySelector(".confirm-order-btn")?.addEventListener("click", async () => {
    if (!userDetails()) return;

    const products = await getCartProducts();
    if (!products.length) {
        alert("❗ Your cart is empty!");
        return;
    }

    const shippingMethod = useExpressShipping ? 'fast' : 'standard';

    try {
        console.log("User ID before placing order:", userId);
        const res = await fetch("php/orders.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `user_id=${userId}&shipping=${shippingMethod}`
        });
        const data = await res.json();

        if (data.status === "success") {
            alert(`✅ Order placed successfully! Your order ID is ${data.order_id}`);
            window.location.href = "index.html";
        } else {
            alert(`❌ ${data.message}`);
        }
    } catch (error) {
        console.error("❌ Error placing order:", error);
        alert("❌ Failed to place order. Please try again.");
    }
});

// --------------- SHIPPING OPTION ----------------
fastDelivery?.addEventListener("click", async () => {
    useExpressShipping = true;
    const products = await getCartProducts();
    await cartBill(products);
});

standardDelivery?.addEventListener("click", async () => {
    useExpressShipping = false;
    const products = await getCartProducts();
    await cartBill(products);
});
