function getCart() {
  try {
    const cart = localStorage.getItem('shopCart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('shopCart', JSON.stringify(cart));
}

async function loadShopData() {
  try {
    const response = await fetch('data/shop.json');
    return await response.json();
  } catch (error) {
    console.error("Error loading shop data:", error);
    return [];
  }
}

function removeFromCart(itemId) {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== itemId);
  saveCart(updatedCart);
  renderCart();
}

async function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return;

  const cart = getCart();
  const shopItems = await loadShopData();
  
  // Create a map of shop items for quick lookup
  const itemsMap = {};
  shopItems.forEach(item => {
    itemsMap[item.id] = item;
  });

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Your cart is empty (for now). Items you add will appear here.</p>
        <a href="shop.html" class="primary-btn">Continue Shopping</a>
      </div>
    `;
    return;
  }

  let total = 0;
  const cartItemsHTML = cart.map(cartItem => {
    const item = itemsMap[cartItem.id];
    if (!item) return '';
    
    const itemTotal = cartItem.price * cartItem.quantity;
    total += itemTotal;
    
    return `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.title}" onerror="this.style.display='none';">
        </div>
        <div class="cart-item-details">
          <h3>${item.title}</h3>
          <p class="cart-item-description">${item.description}</p>
          <div class="cart-item-meta">
            <span class="cart-item-price">$${cartItem.price} × ${cartItem.quantity}</span>
            <span class="cart-item-total">$${itemTotal.toFixed(2)}</span>
          </div>
        </div>
        <button class="remove-item-btn" data-item-id="${cartItem.id}">
          Remove
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="cart-items">
      ${cartItemsHTML}
    </div>
    <div class="cart-footer">
      <div class="cart-total">
        <strong>Total: $${total.toFixed(2)}</strong>
      </div>
      <a href="#" class="primary-btn checkout-btn">Checkout</a>
    </div>
  `;

  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = btn.dataset.itemId;
      removeFromCart(itemId);
    });
  });
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});
