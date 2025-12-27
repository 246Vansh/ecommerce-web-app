// Global Variables
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 40;
let totalProducts = 0;
let totalPages = 0;

// Cached DOM Elements
const lowPrice = document.getElementById("lowPrice");
const highPrice = document.getElementById("highPrice");
const ratingSort = document.getElementById("Rating");
const filterContainer = document.getElementById("category-filter-container");
const productContainer = document.querySelector(".grid-container");
const pageContainer = document.getElementById("pageNumbers");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const dropdownMenu = document.getElementById("dropdown-menu");
const menuButton = document.getElementById("menu-button");
const quickViewModal = document.getElementById("quickViewModal");

// --- Initialization Functions ---

function initDropdownMenu() {
  if (menuButton && dropdownMenu) {
    menuButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
      if (!menuButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.classList.remove("show");
      }
    });
  }
};

function initSorting() {
  if (lowPrice) {
    lowPrice.addEventListener("click", () => {
      filteredProducts.sort((a, b) => a.price - b.price);
      currentPage = 1;
      renderProducts(getPaginatedProducts());
      generatePagination();
    });
  }

  if (highPrice) {
    highPrice.addEventListener("click", () => {
      filteredProducts.sort((a, b) => b.price - a.price);
      currentPage = 1;
      renderProducts(getPaginatedProducts());
      generatePagination();
    });
  }

  if (ratingSort) {
    ratingSort.addEventListener("click", () => {
      filteredProducts.sort((a, b) => b.rating - a.rating);
      currentPage = 1;
      renderProducts(getPaginatedProducts());
      generatePagination();
    });
  }
};

function initFilterCheckboxes() {
  const checkboxes = document.querySelectorAll(".filter-option input[type='checkbox']");
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      const selectedCategories = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value.toLowerCase());

      filteredProducts = selectedCategories.length > 0
        ? allProducts.filter(product =>
          selectedCategories.includes(product.category.toLowerCase())
        )
        : [...allProducts];

      totalProducts = filteredProducts.length;
      totalPages = Math.ceil(totalProducts / itemsPerPage);
      currentPage = 1;
      renderProducts(getPaginatedProducts());
      generatePagination();
    });
  });
};

async function fetchAllProducts() {
  try {
    const response = await fetch("php/getProduct.php");
    const data = await response.json();
    allProducts = data.products;
    totalProducts = allProducts.length;
    totalPages = Math.ceil(totalProducts / itemsPerPage);
    const categories = [...new Set(allProducts.map(product => product.category))];
    renderCategoryFilters(categories);
    filteredProducts = [...allProducts];
    renderProducts(getPaginatedProducts());
    generatePagination();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

function renderProducts(products) {
  productContainer.innerHTML = "";
  products.forEach(product => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
      <div>
        <h2 class="product-title">${product.title}</h2>
        <img src="${product.images[0]}" alt="${product.title}" class="product-image" loading="lazy">
        <p class="product-description">${product.description.substring(0, 60)}...</p>
        <p class="product-price"><strong>Price:</strong> $${product.price}</p>
        <p class="product-category"><strong>Category:</strong> ${product.category}</p>
        <div class="rating">${generateRatingStars(product.rating)}</div>
      </div>
    `;
    const quickViewButton = document.createElement("button");
    quickViewButton.classList.add("quick-view");
    quickViewButton.textContent = "Quick View";
    quickViewButton.addEventListener("click", () => quickViewProduct(product));
    productCard.appendChild(quickViewButton);
    productContainer.appendChild(productCard);
  });
};

function renderCategoryFilters(categories) {
  filterContainer.innerHTML = "";
  categories.forEach(category => {
    const formattedCategory = category.toLowerCase();
    const filterOptionDiv = document.createElement("div");
    filterOptionDiv.classList.add("filter-option");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `category-${formattedCategory}`;
    checkbox.name = "category[]";
    checkbox.value = category;
    checkbox.addEventListener("change", applyCategoryFilter);

    const label = document.createElement("label");
    label.htmlFor = `category-${formattedCategory}`;
    label.textContent = category;

    filterOptionDiv.appendChild(checkbox);
    filterOptionDiv.appendChild(label);
    filterContainer.appendChild(filterOptionDiv);
  });
};

function applyCategoryFilter() {
  const checkboxes = document.querySelectorAll('input[name="category[]"]:checked');
  const selectedCategories = Array.from(checkboxes).map(checkbox => checkbox.value);
  filteredProducts = selectedCategories.length === 0
    ? [...allProducts]
    : allProducts.filter(product => selectedCategories.includes(product.category));
  totalProducts = filteredProducts.length;
  totalPages = Math.ceil(totalProducts / itemsPerPage);
  currentPage = 1;
  renderProducts(getPaginatedProducts());
  generatePagination();
};

function getPaginatedProducts() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
};

function generatePagination() {
  pageContainer.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.classList.add("page-button");
    button.textContent = i;
    if (i === currentPage) button.classList.add("active");
    button.addEventListener("click", () => goToPage(i));
    pageContainer.appendChild(button);
  }
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
};

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderProducts(getPaginatedProducts());
  generatePagination();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

if (prevButton) {
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) goToPage(currentPage + 1);
  });
}


// --- Quick View and Send Product Functions ---

async function quickViewProduct(product) {
  if (!quickViewModal) return;

  quickViewModal.innerHTML = `
      <div class="modal-content">
        <span class="quickCloseBtn">&times;</span>
        <div class="modal-body">
          <img src="${product.images[0]}" alt="${product.title}" class="quickProductImage">
          <div class="quickProductDetails">
            <h2 class="quickProductTitle">${product.title}</h2>
            <p class="quickProductPrice">$${product.price}</p>
            <div class="quickRating">${generateRatingStars(product.rating)}</div>
            <p class="quickProductColor">Color:
              <span class="quickColorOption" style="background: black;"></span>
              <span class="quickColorOption" style="background: gray;"></span>
            </p>
            <p class="quickProductSize">Size:
              <button class="size-btn active">S</button>
              <button class="size-btn">M</button>
              <button class="size-btn">L</button>
              <button class="size-btn">XL</button>
              <button class="size-btn disabled">XXL</button>
            </p>
            <button class="addToBag">Add to Bag</button>
            <button class="viewFullDetails">View Full Details</button>
          </div>
        </div>
      </div>
    `;

  const closeModalBtn = quickViewModal.querySelector(".quickCloseBtn");
  closeModalBtn.addEventListener("click", () => {
    quickViewModal.style.display = "none";
  });

  window.addEventListener("click", function modalOutsideClick(event) {
    if (event.target === quickViewModal) {
      quickViewModal.style.display = "none";
      window.removeEventListener("click", modalOutsideClick);
    }
  });

  const viewDetailsBtn = quickViewModal.querySelector(".viewFullDetails");
  viewDetailsBtn.addEventListener("click", () => {
    window.location.href = `productDetail.html?id=${product.id}`;
  });

  const addToBagBtn = quickViewModal.querySelector(".addToBag");
  addToBagBtn.addEventListener("click", async () => {
    await addToCartBackend(product.id);
  });

  quickViewModal.style.display = "block";
}


async function addToCartBackend(productId, quantity = 1) {
  try {
    const res = await fetch("php/cart/addToCart.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `user_id=${userId}&product_id=${productId}&quantity=${quantity}`
    });

    const text = await res.text();
    console.log("🧾 Server raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      alert("⚠️ No user logged in — cart will not load");
      window.location.href = "loginPage.html";
      return;
    }

    if (data.status === "success") {
      alert("✅ Product added to cart!");
      await updateCartCount();
      window.location.href = "cartPage.html";
    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
  }
}

function generateRatingStars(rating = 0) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    `<span class="star filled">★</span>`.repeat(fullStars) +
    (halfStar ? `<span class="star half">★</span>` : "") +
    `<span class="star">★</span>`.repeat(emptyStars)
  );
}


function toggleFilter(filterType) {
  const filterSection = document.getElementById(`filter-section-${filterType}`);
  const expandIcon = document.querySelector(`.expand-icon-${filterType}`);
  const collapseIcon = document.querySelector(`.collapse-icon-${filterType}`);
  const isHidden = filterSection.classList.contains("hidden");
  filterSection.classList.toggle("hidden", !isHidden);
  expandIcon.classList.toggle("hidden", isHidden);
  collapseIcon.classList.toggle("hidden", !isHidden);
};

// --- Main Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  initDropdownMenu();
  initSorting();
  initFilterCheckboxes();
  await fetchAllProducts();
});
