const dishes = [
  { id: 1, name: "Hyderabadi Chicken Biryani", category: "Non Veg", price: 269, rating: 4.8, image: "https://1.bp.blogspot.com/-3atUVHlsE0U/YIcgH7jHOCI/AAAAAAAASIE/1TxRFFlU5qEK-X7iZry8oQq6f8BivC9DgCLcBGAsYHQ/s1200/Biryani-1.jpg" },
  { id: 2, name: "Masala Dosa", category: "South", price: 120, rating: 4.6, image: "http://1.bp.blogspot.com/-uoVDv32Mxd8/VBKzjO2CAQI/AAAAAAAAAHc/HBvjaa3jH54/s1600/Masala-Dosa-.jpg" },
  { id: 3, name: "Shawarma", category: "Street", price: 110, rating: 4.4, image: "https://img.freepik.com/premium-photo/healthy-shawarma-hd-8k-wallpaper-stock-photographic-image_890746-92817.jpg?w=2000" },
  { id: 4, name: "Pav Bhaji", category: "Street", price: 60, rating: 4.5, image: "https://img.freepik.com/premium-photo/cheese-pav-bhaji-recipe-is-street-food-bhajipav-recipe-with-addition-cheese_466689-86301.jpg?w=1480" },
  { id: 5, name: "Chole Bhature", category: "Street", price: 169, rating: 4.4, image: "https://static.vecteezy.com/system/resources/previews/015/933/726/large_2x/chole-bhature-is-a-north-indian-food-dish-a-combination-of-chana-masala-and-bhatura-or-puri-free-photo.jpg" },
  { id: 6, name: "Veg Thali", category: "Combo", price: 190, rating: 4.9, image: "https://i.pinimg.com/originals/e1/da/d5/e1dad5315972c8a9db86fb01d69c7ecb.jpg" },
  { id: 7, name: "Butter Chicken", category: "Non Veg", price: 199, rating: 4.8, image: "https://infinityrecipes.com/wp-content/uploads/2024/12/ponact_SCENE_A_beautifully_plated_dish_of_Indian_Butter_Chicken_3242358f-749c-4737-9243-d88a1d0f68ff.png" },
  { id: 8, name: "Death By Chocolate", category: "Dessert", price: 256, rating: 4.9, image: "https://im.whatshot.in/img/2019/Nov/youtubevideo-thumbnail-mumbai-1280x720-v6-bangalore-death-by-chocolate-at-corner-house-1573537080.jpg" }
];

const trackingFlow = ["Order placed", "Preparing food", "Out for delivery", "Delivered"];

const state = {
  filter: "All",
  cart: {},
  ratings: {},
  minPrice: null,
  maxPrice: null,
  trackingStep: -1,
  trackingTimer: null
};

const dishGrid = document.getElementById("dishGrid");
const categoryFilters = document.getElementById("categoryFilters");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const subTotal = document.getElementById("subTotal");
const payDetail = document.getElementById("payDetail");
const deliveryAddress = document.getElementById("deliveryAddress");
const deliveryLandmark = document.getElementById("deliveryLandmark");
const trackSteps = document.getElementById("trackSteps");
const orderMeta = document.getElementById("orderMeta");
const toast = document.getElementById("toast");
const trackingSidebar = document.getElementById("trackingSidebar");
const trackingHandle = document.getElementById("trackingDragHandle");
const locationSelect = document.getElementById("locationSelect");
const locationStatus = document.getElementById("locationStatus");
const dashItems = document.getElementById("dashItems");
const dashTotal = document.getElementById("dashTotal");
const dashRating = document.getElementById("dashRating");
const dashLocation = document.getElementById("dashLocation");
const heroProfileBtn = document.getElementById("heroProfileBtn");
const minPriceInput = document.getElementById("minPriceInput");
const maxPriceInput = document.getElementById("maxPriceInput");
const sparkleLayer = document.getElementById("sparkleLayer");
const deliveryPopup = document.getElementById("deliveryPopup");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1400);
}

function toInr(n) {
  return `Rs ${n}`;
}

function openTrackingSidebar() {
  trackingSidebar.classList.add("open");
}

function closeTrackingSidebar() {
  trackingSidebar.classList.remove("open");
}

function saveState() {
  localStorage.setItem("zd_cart", JSON.stringify(state.cart));
  localStorage.setItem("zd_ratings", JSON.stringify(state.ratings));
  localStorage.setItem("zd_location", locationSelect.value || "");
  localStorage.setItem("zd_delivery_address", deliveryAddress.value || "");
  localStorage.setItem("zd_delivery_landmark", deliveryLandmark.value || "");
}

function loadState() {
  state.cart = JSON.parse(localStorage.getItem("zd_cart") || "{}");
  state.ratings = JSON.parse(localStorage.getItem("zd_ratings") || "{}");
  const savedLocation = localStorage.getItem("zd_location") || "";
  locationSelect.value = savedLocation;
  locationStatus.textContent = `Current location: ${savedLocation || "Not selected"}`;
  dashLocation.textContent = savedLocation || "Not selected";
  deliveryAddress.value = localStorage.getItem("zd_delivery_address") || "";
  deliveryLandmark.value = localStorage.getItem("zd_delivery_landmark") || "";
}

function renderFilters() {
  const categories = ["All", ...new Set(dishes.map((dish) => dish.category))];
  categoryFilters.innerHTML = categories
    .map((cat) => `<button class="${state.filter === cat ? "active" : ""}" data-filter="${cat}">${cat}</button>`)
    .join("");

  categoryFilters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderDishes();
    });
  });
}

function dishRating(dish) {
  return state.ratings[dish.id] || Math.round(dish.rating);
}

function renderDishes() {
  const filtered = dishes.filter((dish) => {
    const categoryOk = state.filter === "All" || dish.category === state.filter;
    const minOk = state.minPrice === null || dish.price >= state.minPrice;
    const maxOk = state.maxPrice === null || dish.price <= state.maxPrice;
    return categoryOk && minOk && maxOk;
  });
  dishGrid.innerHTML = filtered
    .map((dish) => {
      const stars = [1, 2, 3, 4, 5]
        .map((s) => `<button class="star-btn ${s <= dishRating(dish) ? "on" : ""}" data-rate-id="${dish.id}" data-rate-star="${s}" type="button">&#9733;</button>`)
        .join("");

      return `
      <article class="dish-card">
        <img src="${dish.image}" alt="${dish.name}" />
        <div class="dish-body">
          <div class="dish-head">
            <strong>${dish.name}</strong>
            <span>${toInr(dish.price)}</span>
          </div>
          <p class="muted">${dish.category}</p>
          <div class="stars">${stars}</div>
          <div class="card-row">
            <small class="muted">${dish.rating}/5 chef rating</small>
            <button class="btn btn-primary" data-add-id="${dish.id}" type="button">Add</button>
          </div>
        </div>
      </article>`;
    })
    .join("");

  if (!filtered.length) {
    dishGrid.innerHTML = "<p class='muted'>No dishes found in this amount range.</p>";
  }

  dishGrid.querySelectorAll("[data-add-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.addId);
      state.cart[id] = (state.cart[id] || 0) + 1;
      saveState();
      renderCart();
      renderDashboard();
      showToast("Added to cart");
    });
  });

  dishGrid.querySelectorAll("[data-rate-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.rateId);
      const star = Number(button.dataset.rateStar);
      state.ratings[id] = star;
      saveState();
      renderDishes();
      renderDashboard();
      showToast(`Rated ${star} stars`);
    });
  });
}

function cartEntries() {
  return Object.entries(state.cart).map(([id, qty]) => {
    const dish = dishes.find((item) => item.id === Number(id));
    return { ...dish, qty };
  });
}

function renderCart() {
  const entries = cartEntries();

  if (!entries.length) {
    cartItems.innerHTML = "<p class='muted'>Cart is empty.</p>";
  } else {
    cartItems.innerHTML = entries
      .map(
        (item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div class="muted">${toInr(item.price)} each</div>
        </div>
        <div class="qty-row">
          <button data-dec-id="${item.id}" type="button">-</button>
          <span>${item.qty}</span>
          <button data-inc-id="${item.id}" type="button">+</button>
        </div>
      </div>`
      )
      .join("");
  }

  cartItems.querySelectorAll("[data-inc-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.incId);
      state.cart[id] += 1;
      saveState();
      renderCart();
      renderDashboard();
    });
  });

  cartItems.querySelectorAll("[data-dec-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.decId);
      state.cart[id] -= 1;
      if (state.cart[id] <= 0) delete state.cart[id];
      saveState();
      renderCart();
      renderDashboard();
    });
  });

  const count = entries.reduce((sum, item) => sum + item.qty, 0);
  const total = entries.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCount.textContent = count;
  subTotal.textContent = toInr(total);
}

function renderDashboard() {
  const entries = cartEntries();
  const totalItems = entries.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = entries.reduce((sum, item) => sum + item.qty * item.price, 0);
  const ratedEntries = entries.map((item) => state.ratings[item.id] || item.rating);
  const avgRating = ratedEntries.length ? (ratedEntries.reduce((a, b) => a + b, 0) / ratedEntries.length).toFixed(1) : "--";
  const selectedLocation = locationSelect.value || "Not selected";

  dashItems.textContent = totalItems;
  dashTotal.textContent = toInr(totalValue);
  dashRating.textContent = avgRating === "--" ? "--" : `${avgRating}/5`;
  dashLocation.textContent = selectedLocation;
}

function renderTracking() {
  trackSteps.innerHTML = trackingFlow
    .map((step, i) => `<div class="step ${i <= state.trackingStep ? "done" : ""}">${step}</div>`)
    .join("");
}

function celebrateDelivery() {
  sparkleLayer.innerHTML = "";
  const count = 120;

  for (let i = 0; i < count; i += 1) {
    const s = document.createElement("span");
    s.className = "sparkle";
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.45;
    const dx = `${(Math.random() - 0.5) * 380}px`;
    const dy = `${120 + Math.random() * 360}px`;
    const delay = `${Math.random() * 180}ms`;

    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", dx);
    s.style.setProperty("--dy", dy);
    s.style.animationDelay = delay;
    sparkleLayer.appendChild(s);
  }

  setTimeout(() => {
    sparkleLayer.innerHTML = "";
  }, 1800);
}

function showDeliveryPopup() {
  deliveryPopup.classList.add("show");
  setTimeout(() => {
    deliveryPopup.classList.remove("show");
  }, 2200);
}

function celebrateDeliveryPopPop() {
  celebrateDelivery();
  setTimeout(() => celebrateDelivery(), 260);
  showDeliveryPopup();
}

function startTracking(orderId) {
  state.trackingStep = 0;
  renderTracking();

  clearInterval(state.trackingTimer);
  state.trackingTimer = setInterval(() => {
    if (state.trackingStep < trackingFlow.length - 1) {
      state.trackingStep += 1;
      renderTracking();
      if (state.trackingStep === trackingFlow.length - 1) {
        orderMeta.textContent = `Order ${orderId} is successfully delivered.`;
        celebrateDeliveryPopPop();
        showToast("Order successfully delivered");
      }
    } else {
      clearInterval(state.trackingTimer);
    }
  }, 3500);

  orderMeta.textContent = `Order ${orderId} confirmed and in progress.`;
  openTrackingSidebar();
}

function getSelectedPayMode() {
  return document.querySelector('input[name="payMode"]:checked').value;
}

function setupDraggableTrackingSidebar() {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  trackingHandle.addEventListener("mousedown", (event) => {
    dragging = true;
    offsetX = event.clientX - trackingSidebar.offsetLeft;
    offsetY = event.clientY - trackingSidebar.offsetTop;
  });

  document.addEventListener("mousemove", (event) => {
    if (!dragging) return;
    const maxX = window.innerWidth - trackingSidebar.offsetWidth;
    const maxY = window.innerHeight - trackingSidebar.offsetHeight;
    const nextX = Math.min(Math.max(8, event.clientX - offsetX), Math.max(8, maxX - 8));
    const nextY = Math.min(Math.max(70, event.clientY - offsetY), Math.max(70, maxY - 8));
    trackingSidebar.style.left = `${nextX}px`;
    trackingSidebar.style.top = `${nextY}px`;
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
  });
}

function setupEvents() {
  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.getElementById("siteNav").classList.remove("open");
    });
  });

  const trackingLink = document.querySelector('.site-nav a[href="#tracking"]');
  trackingLink.addEventListener("click", () => {
    openTrackingSidebar();
  });

  document.getElementById("menuToggle").addEventListener("click", () => {
    document.getElementById("siteNav").classList.toggle("open");
  });

  document.getElementById("cartBtn").addEventListener("click", () => {
    document.getElementById("cart").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("openTrackingBtn").addEventListener("click", () => {
    openTrackingSidebar();
  });

  document.getElementById("closeTrackingBtn").addEventListener("click", () => {
    closeTrackingSidebar();
  });

  document.getElementById("clearCartBtn").addEventListener("click", () => {
    state.cart = {};
    saveState();
    renderCart();
    renderDashboard();
    showToast("Cart cleared");
  });

  document.getElementById("goPaymentBtn").addEventListener("click", () => {
    document.getElementById("payment").scrollIntoView({ behavior: "smooth" });
  });

  document.querySelectorAll('input[name="payMode"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const mode = getSelectedPayMode();
      if (mode === "UPI") payDetail.placeholder = "Enter UPI ID";
      if (mode === "Card") payDetail.placeholder = "Enter card number";
      if (mode === "Wallet") payDetail.placeholder = "Enter wallet mobile";
      if (mode === "Cash on Delivery") payDetail.placeholder = "No details required";
    });
  });

  document.getElementById("placeOrderBtn").addEventListener("click", () => {
    const entries = cartEntries();
    if (!entries.length) {
      showToast("Add dishes to cart first");
      return;
    }

    const mode = getSelectedPayMode();
    const detail = payDetail.value.trim();
    const fullAddress = deliveryAddress.value.trim();
    if (mode !== "Cash on Delivery" && !detail) {
      showToast("Enter payment details");
      return;
    }
    if (!fullAddress) {
      showToast("Enter delivery address");
      deliveryAddress.focus();
      return;
    }

    const orderId = `FE${Date.now().toString().slice(-6)}`;
    startTracking(orderId);
    showToast(`Order placed with ${mode}`);
  });

  locationSelect.addEventListener("change", () => {
    const selected = locationSelect.value || "Not selected";
    locationStatus.textContent = `Current location: ${selected}`;
    saveState();
    renderDashboard();
    showToast("Location updated");
  });

  deliveryAddress.addEventListener("input", saveState);
  deliveryLandmark.addEventListener("input", saveState);

  heroProfileBtn.addEventListener("click", () => {
    const selectedCity = locationSelect.value || "Not selected";
    showToast(`Profile: Guest user | City: ${selectedCity}`);
  });

  document.getElementById("applyPriceFilterBtn").addEventListener("click", () => {
    const min = minPriceInput.value.trim();
    const max = maxPriceInput.value.trim();
    state.minPrice = min === "" ? null : Number(min);
    state.maxPrice = max === "" ? null : Number(max);

    if (state.minPrice !== null && state.maxPrice !== null && state.minPrice > state.maxPrice) {
      showToast("Min amount cannot be greater than max amount");
      return;
    }

    renderDishes();
    showToast("Amount range filter applied");
  });

  document.getElementById("resetPriceFilterBtn").addEventListener("click", () => {
    state.minPrice = null;
    state.maxPrice = null;
    minPriceInput.value = "";
    maxPriceInput.value = "";
    renderDishes();
    showToast("Amount range filter reset");
  });
}

function setupAnimations() {
  const revealTargets = document.querySelectorAll(".section, .site-footer");
  revealTargets.forEach((el) => el.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.12 }
  );

  revealTargets.forEach((el) => observer.observe(el));
}

loadState();
setupDraggableTrackingSidebar();
setupEvents();
setupAnimations();
renderFilters();
renderDishes();
renderCart();
renderTracking();
renderDashboard();
