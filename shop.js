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

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.getElementById('cartCount');
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
  }
}

function addToCart(itemId, price) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === itemId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: itemId, price: price, quantity: 1 });
  }
  
  saveCart(cart);
  updateCartCount();
}

async function loadShopItems() {
  try {
    const response = await fetch('data/shop.json');
    const items = await response.json();

    const grid = document.getElementById('shop-grid');
    grid.innerHTML = '';

    items.forEach(item => {
      const el = document.createElement('div');
      el.classList.add('shop-item');

      el.innerHTML = `
        <div class="shop-item-image">
          <img src="${item.image}" alt="${item.title}" class="shop-img" onerror="this.style.display='none';">
        </div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button class="add-to-cart-btn" data-item-id="${item.id}" data-item-price="${item.price}">
          Add to Cart - $${item.price}
        </button>
      `;

      grid.appendChild(el);
    });

    // Add event listeners to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const itemId = btn.dataset.itemId;
        const price = parseFloat(btn.dataset.itemPrice);
        addToCart(itemId, price);
      });
    });

    // Update cart count on load
    updateCartCount();

  } catch (error) {
    console.error("Error loading shop items:", error);
  }
}

loadShopItems();
