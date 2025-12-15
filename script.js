const products = [
  { id: 1, name: "Grain Pack", price: 5.00, desc: "Staple carbohydrates.", img: "img/grain.jpg" },
  { id: 2, name: "Canned Goods", price: 7.50, desc: "Canned vegetables, fruits, and proteins.", img: "img/canned.jpg" },
  { id: 3, name: "Fruit Pack", price: 5.00, desc: "Vitamin-rich fruits.", img: "img/fruit.jpg" },
  { id: 4, name: "Vegetable Pack", price: 5.00, desc: "Nutrient-rich vegetables.", img: "img/vegetable.jpg" },
  { id: 5, name: "Protein Pack", price: 7.50, desc: "Essential proteins.", img: "img/protein.jpg" },
  { id: 6, name: "Breakfast Pack", price: 6.00, desc: "Morning meals.", img: "img/breakfast.jpg" },
  { id: 7, name: "Lunch Pack", price: 7.50, desc: "Lunch meals.", img: "img/lunch.jpg" },
  { id: 8, name: "Dinner Pack", price: 8.50, desc: "Dinner meals.", img: "img/dinner.jpg" },
  { id: 9, name: "Kids Pack", price: 6.00, desc: "Kid-sized meals.", img: "img/kids.jpg" },
  { id: 10, name: "Money Pack", price: 50.00, desc: "Donate hard cash.", img: "img/money.jpg" }
];

let cart = {};
const TAX_RATE = 0.10;
const DISCOUNT_THRESHOLD = 3;
const DISCOUNT_RATE = 0.10;

const $ = id => document.getElementById(id);


function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function showToast(msg) {
  const toastEl = $("liveToast");
  const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
  $("toastBody").textContent = msg;
  bsToast.show();
}


function renderProducts() {
  const row = $("productsRow");
  row.innerHTML = "";

  products.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 d-flex";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${p.img}" class="card-img-top" alt="${escapeHtml(p.name)}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-1">${escapeHtml(p.name)}</h5>
          <p class="card-text text-muted small mb-2">${escapeHtml(p.desc)}</p>
          <div class="mt-auto d-flex align-items-center justify-content-between">
            <div class="fw-bold">€${p.price.toFixed(2)}</div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary btn-decrease" data-id="${p.id}"><i class="bi bi-dash"></i></button>
              <button class="btn btn-primary btn-add" data-id="${p.id}">Add</button>
              <button class="btn btn-outline-secondary btn-increase" data-id="${p.id}"><i class="bi bi-plus"></i></button>
            </div>
          </div>
        </div>
      </div>
    `;
    row.appendChild(col);
  });

  document.querySelectorAll(".btn-add").forEach(b => b.addEventListener("click", e => addToCart(Number(e.currentTarget.dataset.id), 1)));
  document.querySelectorAll(".btn-increase").forEach(b => b.addEventListener("click", e => addToCart(Number(e.currentTarget.dataset.id), 1)));
  document.querySelectorAll(".btn-decrease").forEach(b => b.addEventListener("click", e => removeOneFromCart(Number(e.currentTarget.dataset.id))));
}


function addToCart(productId, qty = 1) {
  cart[productId] = (cart[productId] || 0) + qty;
  if (cart[productId] <= 0) delete cart[productId];
  updateCartUI();
  showToast("Item added to cart");
}

function removeOneFromCart(productId) {
  if (!cart[productId]) return;
  cart[productId]--;
  if (cart[productId] <= 0) delete cart[productId];
  updateCartUI();
  showToast("Item removed from cart");
}

function clearCart() {
  cart = {};
  updateCartUI();
  showToast("Cart cleared");
}


function calculateTotals() {
  let subtotal = 0, itemCount = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const product = products.find(p => p.id === Number(id));
    if (!product) continue;
    subtotal += product.price * qty;
    itemCount += qty;
  }
  const discount = itemCount >= DISCOUNT_THRESHOLD ? subtotal * DISCOUNT_RATE : 0;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;
  return { subtotal, discount, tax, total, itemCount };
}


function updateCartUI() {
  const totals = calculateTotals();


  const cartPreview = $("cartPreview");
  cartPreview.innerHTML = "";
  if (totals.itemCount === 0) {
    cartPreview.innerHTML = `<p class="text-muted small">Your cart is empty.</p>`;
  } else {
    for (const [id, qty] of Object.entries(cart)) {
      const product = products.find(p => p.id === Number(id));
      if (!product) continue;
      const div = document.createElement("div");
      div.className = "d-flex justify-content-between mb-2";
      div.textContent = `${product.name} x ${qty} - €${(product.price * qty).toFixed(2)}`;
      cartPreview.appendChild(div);
    }
  }
  $("cartPreviewBadge").textContent = `${totals.itemCount} items`;


  const offBody = $("offcanvasCartBody");
  offBody.innerHTML = "";
  if (totals.itemCount === 0) {
    offBody.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
  } else {
    for (const [id, qty] of Object.entries(cart)) {
      const product = products.find(p => p.id === Number(id));
      if (!product) continue;
      const div = document.createElement("div");
      div.className = "d-flex justify-content-between mb-2";
      div.textContent = `${product.name} x ${qty} - €${(product.price * qty).toFixed(2)}`;
      offBody.appendChild(div);
    }
  }


  const summary = $("orderSummary");
  summary.innerHTML = "";
  if (totals.itemCount === 0) {
    summary.innerHTML = `<p class="text-muted">No items yet.</p>`;
  } else {
    for (const [id, qty] of Object.entries(cart)) {
      const product = products.find(p => p.id === Number(id));
      if (!product) continue;
      const div = document.createElement("div");
      div.className = "d-flex justify-content-between mb-2";
      div.innerHTML = `<span>${product.name} x ${qty}</span> <span>€${(product.price * qty).toFixed(2)}</span>`;
      summary.appendChild(div);
    }
  }


  $("subtotalText").textContent = `€${totals.subtotal.toFixed(2)}`;
  $("discountText").textContent = `€${totals.discount.toFixed(2)}`;
  $("taxText").textContent = `€${totals.tax.toFixed(2)}`;
  $("totalText").textContent = `€${totals.total.toFixed(2)}`;
  $("offcanvasSubtotal").textContent = `€${totals.subtotal.toFixed(2)}`;
  $("offcanvasTotalItems").textContent = totals.itemCount;
}



function bindCheckout() {
  const form = $("checkoutForm");

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    if (Object.keys(cart).length === 0) {
      showToast("Cart is empty");
      return;
    }

    const totals = calculateTotals();


    let itemsHtml = Object.entries(cart).map(([id, qty]) => {
      const product = products.find(p => p.id === Number(id));
      return `<tr><td>${product.name}</td><td class="text-center">${qty}</td><td class="text-end">€${(product.price * qty).toFixed(2)}</td></tr>`;
    }).join("");

    $("confirmationBody").innerHTML = `
      <p class="mb-2"><strong>Thank you for your donation!</strong></p>
      <h6 class="mt-3">Items donated</h6>
      <table class="table table-sm">
        <thead><tr><th>Item</th><th class="text-center">Qty</th><th class="text-end">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <hr>
      <div class="d-flex justify-content-between"><span>Subtotal</span><span>€${totals.subtotal.toFixed(2)}</span></div>
      <div class="d-flex justify-content-between"><span>Discount</span><span>- €${totals.discount.toFixed(2)}</span></div>
      <div class="d-flex justify-content-between"><span>Tax (VAT 10%)</span><span>€${totals.tax.toFixed(2)}</span></div>
      <div class="d-flex justify-content-between fw-bold fs-5 mt-2"><span>Total</span><span>€${totals.total.toFixed(2)}</span></div>
      <p class="small text-muted mt-3">A confirmation email will be sent to <strong>${$("email").value}</strong>.</p>
    `;

    new bootstrap.Modal($("confirmationModal")).show();
    clearCart();
    form.reset();
    form.classList.remove("was-validated");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  updateCartUI();

  const shippingCollapse = new bootstrap.Collapse($("shippingCollapse"), { toggle: false });

  $("checkoutBtn").addEventListener("click", () => shippingCollapse.show());

  const offcanvasEl = $("offcanvasCart");
  const offcanvasInstance = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);

  $("offcanvasCheckoutBtn").addEventListener("click", () => {

    offcanvasInstance.hide();


    offcanvasEl.addEventListener("hidden.bs.offcanvas", function handler() {
      shippingCollapse.show();
      offcanvasEl.removeEventListener("hidden.bs.offcanvas", handler);

      $("shippingCollapse").scrollIntoView({ behavior: "smooth" });
    });
  });

  $("clearCartBtn").addEventListener("click", clearCart);
  $("offcanvasClearBtn").addEventListener("click", clearCart);

  bindCheckout();
});
