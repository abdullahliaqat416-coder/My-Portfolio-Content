/**
 * ATELIER LUMEN — Luxury Boutique & Lookbook Studio
 * Complete Client-Side Interactions, Cart Drawer & Persistence Engine
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ================= STATE & PERSISTENCE ================= */
  const CART_KEY = 'atelier_lumen_cart_v1';
  const WISHLIST_KEY = 'atelier_lumen_wishlist_v1';

  const DEFAULT_CART = [
    {
      id: 'lumen-weekender',
      title: 'Lumen Leather Weekender',
      cat: 'No. 04 — Travel',
      price: 390,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'ceramic-vessel',
      title: 'No. 04 Ceramic Vessel',
      cat: 'No. 01 — Objects',
      price: 120,
      qty: 1,
      image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const DEFAULT_WISHLIST = [
    {
      id: 'linen-overshirt',
      title: 'Espresso Linen Overshirt',
      cat: 'No. 03 — Wear',
      price: 420,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'wool-coat',
      title: 'Linea Wool Coat',
      cat: 'No. 06 — Wear',
      price: 480,
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80'
    }
  ];

  function getCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : DEFAULT_CART;
    } catch (e) {
      return DEFAULT_CART;
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateCartUI();
  }

  function getWishlist() {
    try {
      const data = localStorage.getItem(WISHLIST_KEY);
      return data ? JSON.parse(data) : DEFAULT_WISHLIST;
    } catch (e) {
      return DEFAULT_WISHLIST;
    }
  }

  function saveWishlist(list) {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  /* ================= TOAST NOTIFICATION ================= */
  let toastEl = document.querySelector('.toast-notice');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast-notice';
    document.body.appendChild(toastEl);
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('show');
    setTimeout(() => {
      toastEl.classList.remove('show');
    }, 2800);
  }

  /* ================= CART DRAWER DOM INJECTION ================= */
  let drawerOverlay = document.querySelector('.cart-drawer-overlay');
  let drawerEl = document.querySelector('.cart-drawer');

  if (!drawerOverlay || !drawerEl) {
    drawerOverlay = document.createElement('div');
    drawerOverlay.className = 'cart-drawer-overlay';
    document.body.appendChild(drawerOverlay);

    drawerEl = document.createElement('div');
    drawerEl.className = 'cart-drawer';
    drawerEl.innerHTML = `
      <div class="cart-drawer-header">
        <h3>Your Bag (<span class="drawer-count">0</span>)</h3>
        <button class="cart-drawer-close" aria-label="Close Bag">&times;</button>
      </div>
      <div class="drawer-free-shipping">
        <div class="free-shipping-text">Complimentary shipping on orders over $300</div>
        <div class="free-shipping-bar">
          <div class="free-shipping-progress" style="width: 100%;"></div>
        </div>
      </div>
      <div class="cart-drawer-body">
        <div class="drawer-items"></div>
      </div>
      <div class="cart-drawer-footer">
        <div class="drawer-subtotal">
          <span>Subtotal</span>
          <span class="drawer-total-amount">$0</span>
        </div>
        <p class="drawer-tax-note">Taxes and shipping calculated at checkout.</p>
        <div class="drawer-actions">
          <a href="checkout.html" class="btn btn-fill btn-block">Proceed to Checkout</a>
          <a href="cart.html" class="btn btn-block btn-sm">View Full Bag</a>
        </div>
      </div>
    `;
    document.body.appendChild(drawerEl);
  }

  const drawerCloseBtn = drawerEl.querySelector('.cart-drawer-close');

  function openCartDrawer() {
    drawerOverlay.classList.add('open');
    drawerEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }

  function closeCartDrawer() {
    drawerOverlay.classList.remove('open');
    drawerEl.classList.remove('open');
    if (!document.getElementById('nav-overlay') || !document.getElementById('nav-overlay').classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  drawerOverlay.addEventListener('click', closeCartDrawer);
  drawerCloseBtn && drawerCloseBtn.addEventListener('click', closeCartDrawer);

  /* Intercept Bag icons in header */
  document.querySelectorAll('.header-actions a[href*="cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // If we are already on cart.html, let it navigate, otherwise open drawer
      if (!window.location.pathname.endsWith('cart.html')) {
        e.preventDefault();
        openCartDrawer();
      }
    });
  });

  /* ================= RENDER CART DRAWER ================= */
  function renderCartDrawer() {
    const cart = getCart();
    const countEl = drawerEl.querySelector('.drawer-count');
    const itemsContainer = drawerEl.querySelector('.drawer-items');
    const totalEl = drawerEl.querySelector('.drawer-total-amount');
    const progressEl = drawerEl.querySelector('.free-shipping-progress');
    const shippingTextEl = drawerEl.querySelector('.free-shipping-text');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    if (countEl) countEl.textContent = totalQty;
    if (totalEl) totalEl.textContent = `$${subtotal.toLocaleString()}`;

    // Shipping progress
    if (progressEl && shippingTextEl) {
      if (subtotal >= 300) {
        progressEl.style.width = '100%';
        shippingTextEl.textContent = 'You have qualified for complimentary shipping.';
      } else {
        const pct = Math.min(100, Math.round((subtotal / 300) * 100));
        progressEl.style.width = `${pct}%`;
        shippingTextEl.textContent = `Add $${300 - subtotal} more for complimentary shipping.`;
      }
    }

    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="drawer-empty">
          <p>Your bag is currently empty.</p>
          <a href="shop.html" class="btn btn-sm" onclick="document.querySelector('.cart-drawer-close').click()">Discover the Edit</a>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = cart.map(item => `
      <div class="drawer-item" data-id="${item.id}">
        <div class="drawer-item-img" style="background-image: url('${item.image}')"></div>
        <div class="drawer-item-info">
          <h4>${item.title}</h4>
          <span class="item-cat">${item.cat}</span>
          <span class="drawer-item-price">$${item.price}</span>
          <div class="drawer-qty">
            <button data-action="dec" data-id="${item.id}">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="drawer-item-remove" data-id="${item.id}">Remove</button>
      </div>
    `).join('');

    // Attach quantity & remove listeners
    itemsContainer.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        let c = getCart();
        const item = c.find(x => x.id === id);
        if (item) {
          if (action === 'inc') {
            item.qty += 1;
          } else if (action === 'dec') {
            item.qty = Math.max(1, item.qty - 1);
          }
          saveCart(c);
          renderCartDrawer();
        }
      });
    });

    itemsContainer.querySelectorAll('.drawer-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        let c = getCart().filter(x => x.id !== id);
        saveCart(c);
        renderCartDrawer();
        showToast('Item removed from your bag');
      });
    });
  }

  /* ================= UPDATE CART UI ACROSS PAGE ================= */
  function updateCartUI() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

    // Update all header badges
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = totalQty;
    });

    // Update cart.html if present
    if (window.location.pathname.endsWith('cart.html')) {
      renderCartPage();
    }

    // Update checkout.html if present
    if (window.location.pathname.endsWith('checkout.html')) {
      renderCheckoutPage();
    }
  }

  /* ================= ADD TO CART HANDLER ================= */
  window.addToCart = function(product) {
    let cart = getCart();
    const existing = cart.find(x => x.id === product.id);
    if (existing) {
      existing.qty += (product.qty || 1);
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        cat: product.cat || 'Atelier Lumen',
        price: Number(product.price),
        qty: product.qty || 1,
        image: product.image
      });
    }
    saveCart(cart);
    showToast(`Added ${product.title} to your bag`);
    openCartDrawer();
  };

  /* Attach click handlers to any button with data-cart-add or .quick-add-btn */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.quick-add-btn, [data-action="add-to-cart"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.dataset.id || 'item-' + Date.now();
    const title = btn.dataset.title || btn.closest('.product-card, .product-info-detail')?.querySelector('h3, h1')?.textContent.trim() || 'Atelier Object';
    const priceText = btn.dataset.price || btn.closest('.product-card, .product-info-detail')?.querySelector('.price')?.textContent.replace(/[^0-9]/g, '') || '120';
    const price = parseInt(priceText, 10) || 120;
    const cat = btn.dataset.cat || btn.closest('.product-card, .product-info-detail')?.querySelector('.product-code, .eyebrow')?.textContent.trim() || 'No. 01 — Objects';
    
    // Check for image
    let image = btn.dataset.image;
    if (!image) {
      const ph = btn.closest('.product-card, .product-detail')?.querySelector('.ph');
      if (ph) {
        const bg = window.getComputedStyle(ph).backgroundImage;
        const match = bg.match(/url\(["']?([^"']+)["']?\)/);
        if (match) image = match[1];
      }
    }
    if (!image) {
      image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80';
    }

    addToCart({ id, title, price, cat, image, qty: 1 });
  });

  /* PDP Add to Bag button */
  const pdpAddBtn = document.querySelector('.product-info-detail .btn-fill');
  if (pdpAddBtn && !pdpAddBtn.classList.contains('attached')) {
    pdpAddBtn.classList.add('attached');
    pdpAddBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = document.querySelector('.product-info-detail h1')?.textContent.trim() || 'Espresso Linen Overshirt';
      const priceText = document.querySelector('.product-info-detail .price')?.textContent.replace(/[^0-9]/g, '') || '420';
      const cat = document.querySelector('.product-info-detail .eyebrow')?.textContent.trim() || 'Wear — No. 03';
      const ph = document.querySelector('.gallery-main');
      let image = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80';
      if (ph) {
        const bg = window.getComputedStyle(ph).backgroundImage;
        const match = bg.match(/url\(["']?([^"']+)["']?\)/);
        if (match) image = match[1];
      }
      addToCart({
        id: 'pdp-' + title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        title,
        price: parseInt(priceText, 10),
        cat,
        image,
        qty: 1
      });
    });
  }

  /* ================= RENDER CART PAGE ================= */
  function renderCartPage() {
    const cart = getCart();
    const cartLayout = document.querySelector('.cart-layout');
    if (!cartLayout) return;

    const listCol = cartLayout.querySelector(':scope > div:first-child');
    const summaryCol = cartLayout.querySelector('.order-summary');
    const heroTitle = document.querySelector('.page-hero h1');

    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal >= 300 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    if (heroTitle) {
      heroTitle.textContent = `${totalQty} Item${totalQty === 1 ? '' : 's'}`;
    }

    if (cart.length === 0) {
      listCol.innerHTML = `
        <div style="padding: 60px 0; text-align: center;">
          <p style="font-family: var(--serif); font-size: 22px; margin-bottom: 24px; font-style: italic;">Your bag is empty.</p>
          <a href="shop.html" class="btn btn-fill">Explore the Collection</a>
        </div>
      `;
      if (summaryCol) {
        summaryCol.innerHTML = `
          <h3>Order Summary</h3>
          <div class="summary-row"><span>Subtotal</span><span>$0</span></div>
          <div class="summary-row"><span>Shipping</span><span>$0</span></div>
          <div class="summary-row"><span>Estimated Tax</span><span>$0</span></div>
          <div class="summary-row total"><span>Total</span><span>$0</span></div>
        `;
      }
      return;
    }

    let rowsHtml = cart.map(item => `
      <div class="cart-row" data-id="${item.id}">
        <div class="ph" style="background-image: url('${item.image}'); aspect-ratio: 1/1;"></div>
        <div>
          <h3>${item.title}</h3>
          <span class="variant">${item.cat}</span><br>
          <a href="#" class="remove-link" data-id="${item.id}" style="margin-top:10px;display:inline-block;">Remove</a>
        </div>
        <div class="qty-stepper">
          <button data-action="dec" data-id="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-action="inc" data-id="${item.id}">+</button>
        </div>
        <span class="price">$${(item.price * item.qty).toLocaleString()}</span>
      </div>
    `).join('');

    rowsHtml += `
      <div style="margin-top:30px;">
        <a href="shop.html" class="text-link">Continue Shopping</a>
      </div>
    `;

    listCol.innerHTML = rowsHtml;

    // Attach listeners
    listCol.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        let c = getCart();
        const item = c.find(x => x.id === id);
        if (item) {
          if (action === 'inc') item.qty += 1;
          else if (action === 'dec') item.qty = Math.max(1, item.qty - 1);
          saveCart(c);
        }
      });
    });

    listCol.querySelectorAll('.remove-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.dataset.id;
        let c = getCart().filter(x => x.id !== id);
        saveCart(c);
        showToast('Item removed from your bag');
      });
    });

    if (summaryCol) {
      summaryCol.innerHTML = `
        <h3>Order Summary</h3>
        <div class="promo-row">
          <input type="text" placeholder="Gift card or promo code">
          <button type="button" onclick="showToast('Promo code applied')">Apply</button>
        </div>
        <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toLocaleString()}</span></div>
        <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : '$' + shipping}</span></div>
        <div class="summary-row"><span>Estimated Tax</span><span>$${tax.toLocaleString()}</span></div>
        <div class="summary-row total"><span>Total</span><span>$${total.toLocaleString()}</span></div>
        <a href="checkout.html" class="btn btn-fill btn-block" style="margin-top:24px;">Proceed to Checkout</a>
      `;
    }
  }

  /* ================= RENDER CHECKOUT PAGE ================= */
  function renderCheckoutPage() {
    const summaryCard = document.querySelector('.summary-card');
    if (!summaryCard) return;

    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal >= 300 ? 0 : 25;
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + shipping + tax;

    let itemsHtml = cart.map(item => `
      <div class="summary-line">
        <div class="ph" style="background-image: url('${item.image}'); width: 60px; height: 60px; flex-shrink: 0;"></div>
        <div class="info">
          <strong>${item.title}</strong>
          <span style="display:block; color: var(--espresso-soft); font-size: 11px;">Qty: ${item.qty} · ${item.cat}</span>
          <span style="color: var(--terracotta-deep);">$${(item.price * item.qty).toLocaleString()}</span>
        </div>
      </div>
    `).join('');

    summaryCard.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-items" style="max-height: 280px; overflow-y: auto; margin-bottom: 20px;">
        ${itemsHtml}
      </div>
      <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'Complimentary' : '$' + shipping}</span></div>
      <div class="summary-row"><span>Taxes</span><span>$${tax.toLocaleString()}</span></div>
      <div class="summary-row total" style="border-top: 1px solid var(--espresso); margin-top: 10px; padding-top: 16px; font-weight: 600;">
        <span>Total</span>
        <span style="color: var(--terracotta-deep); font-size: 18px;">$${total.toLocaleString()}</span>
      </div>
    `;

    const placeOrderBtn = document.querySelector('button[type="submit"].btn-fill');
    if (placeOrderBtn) {
      placeOrderBtn.textContent = `Place Order — $${total.toLocaleString()}`;
    }
  }

  /* ================= WISHLIST TOGGLE & RENDER ================= */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-toggle-btn, [aria-label="Add to Wishlist"]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest('.product-card, .product-info-detail');
    const title = card?.querySelector('h3, h1')?.textContent.trim() || 'Atelier Piece';
    const priceText = card?.querySelector('.price')?.textContent.replace(/[^0-9]/g, '') || '250';
    const cat = card?.querySelector('.product-code, .eyebrow')?.textContent.trim() || 'Studio Edition';
    
    let image = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80';
    const ph = card?.querySelector('.ph');
    if (ph) {
      const bg = window.getComputedStyle(ph).backgroundImage;
      const match = bg.match(/url\(["']?([^"']+)["']?\)/);
      if (match) image = match[1];
    }

    const id = 'w-' + title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let wishlist = getWishlist();
    const existingIndex = wishlist.findIndex(x => x.id === id);

    if (existingIndex > -1) {
      wishlist.splice(existingIndex, 1);
      btn.classList.remove('active');
      btn.textContent = '♡';
      showToast(`Removed from your wishlist`);
    } else {
      wishlist.push({ id, title, price: parseInt(priceText, 10), cat, image });
      btn.classList.add('active');
      btn.textContent = '♥';
      showToast(`Saved to your wishlist`);
    }
    saveWishlist(wishlist);

    if (window.location.pathname.endsWith('wishlist.html')) {
      renderWishlistPage();
    }
  });

  function renderWishlistPage() {
    const grid = document.querySelector('.wishlist-grid');
    if (!grid) return;

    const list = getWishlist();
    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 60px 0; text-align: center;">
          <p style="font-family: var(--serif); font-size: 22px; margin-bottom: 20px; font-style: italic;">You have no saved pieces.</p>
          <a href="shop.html" class="btn btn-fill">Browse the Collection</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(item => `
      <div class="wishlist-card" data-id="${item.id}">
        <a href="product.html">
          <div class="ph" style="background-image: url('${item.image}'); aspect-ratio: 3/4; position: relative;">
            <button class="remove-heart" data-id="${item.id}" aria-label="Remove from wishlist">✕</button>
          </div>
        </a>
        <div class="product-info">
          <div>
            <h3>${item.title}</h3>
            <span class="product-code">${item.cat}</span>
          </div>
          <span class="price">$${item.price}</span>
        </div>
        <div class="product-card-actions" style="margin-top: 12px;">
          <button class="btn btn-sm btn-block move-to-bag-btn" data-id="${item.id}" data-title="${item.title}" data-price="${item.price}" data-image="${item.image}" data-cat="${item.cat}">Move to Bag</button>
        </div>
      </div>
    `).join('');

    // Attach remove listener
    grid.querySelectorAll('.remove-heart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        let w = getWishlist().filter(x => x.id !== id);
        saveWishlist(w);
        renderWishlistPage();
        showToast('Item removed from wishlist');
      });
    });

    // Move to bag
    grid.querySelectorAll('.move-to-bag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const title = btn.dataset.title;
        const price = parseInt(btn.dataset.price, 10);
        const image = btn.dataset.image;
        const cat = btn.dataset.cat;
        addToCart({ id, title, price, image, cat, qty: 1 });
        // remove from wishlist
        let w = getWishlist().filter(x => x.id !== id);
        saveWishlist(w);
        renderWishlistPage();
      });
    });
  }

  if (window.location.pathname.endsWith('wishlist.html')) {
    renderWishlistPage();
  }

  /* ================= FULL-SCREEN NAV ================= */
  const navOverlay = document.getElementById('nav-overlay');
  const menuToggle = document.querySelector('.menu-toggle');
  const navClose = document.getElementById('nav-close');

  function openNav() {
    if (!navOverlay) return;
    navOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeNav() {
    if (!navOverlay) return;
    navOverlay.classList.remove('open');
    if (!drawerOverlay || !drawerOverlay.classList.contains('open')) {
      document.body.style.overflow = '';
    }
    menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle && menuToggle.addEventListener('click', openNav);
  navClose && navClose.addEventListener('click', closeNav);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeNav();
      closeCartDrawer();
    }
  });
  document.querySelectorAll('.nav-overlay a').forEach(a => a.addEventListener('click', closeNav));

  /* ================= ACCORDIONS ================= */
  document.querySelectorAll('.accordion-item').forEach(item => {
    const head = item.querySelector('.accordion-head');
    head && head.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ================= SIZE SELECTORS ================= */
  document.querySelectorAll('.size-grid').forEach(grid => {
    grid.querySelectorAll('.size-option').forEach(opt => {
      opt.addEventListener('click', () => {
        grid.querySelectorAll('.size-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
      });
    });
  });

  /* ================= FILTER CHIPS (CATEGORY PAGES) ================= */
  document.querySelectorAll('.filter-chips').forEach(bar => {
    bar.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.textContent.trim().toLowerCase();
        const cards = document.querySelectorAll('.product-grid .product-card');
        let visibleCount = 0;
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          if (filter === 'all' || text.includes(filter) || card.dataset.category === filter) {
            card.style.display = '';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        });
        const countEl = document.querySelector('.filter-count');
        if (countEl) countEl.textContent = `${visibleCount} Pieces`;
      });
    });
  });

  /* ================= SEARCH FILTER (search.html) ================= */
  const searchInput = document.querySelector('.search-input-wrap input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.product-grid .product-card');
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const cat = card.querySelector('.product-code')?.textContent.toLowerCase() || '';
        if (!query || title.includes(query) || cat.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        searchInput.value = chip.textContent.trim();
        searchInput.dispatchEvent(new Event('input'));
      });
    });
  }

  /* ================= NEWSLETTER FORMS ================= */
  document.querySelectorAll('.newsletter-form, .footer-newsletter form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Thank you';
        setTimeout(() => btn.textContent = original, 2200);
      }
      showToast('Thank you for joining our correspondence.');
      form.reset();
    });
  });

  /* ================= CHECKOUT / CONTACT SUBMIT ================= */
  document.querySelectorAll('form.demo-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      showToast('Order confirmed. Thank you for your patronage.');
      localStorage.removeItem(CART_KEY);
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    });
  });

  // Initial UI refresh
  updateCartUI();
});
