/* =========================================================
   OBJECT MARKET — Marketplace Behavior & Cart Management
========================================================= */

(function() {
  'use strict';

  const CART_KEY = 'object_market_cart_v1';
  const WISH_KEY = 'object_market_wishlist_v1';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch(e) {}
    updateCartUI();
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    try {
      localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    } catch(e) {}
    updateWishlistUI();
  }

  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      existing.qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id,
        brand: item.brand || 'OBJECT MARKET',
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        qty: item.qty || 1
      });
    }
    saveCart(cart);
    openCartDrawer();
  }

  function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(i => i.id !== id);
    saveCart(cart);
  }

  function updateQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        removeFromCart(id);
        return;
      }
      saveCart(cart);
    }
  }

  function updateWishlistUI() {
    const wishlist = getWishlist();
    document.querySelectorAll('.wish-count').forEach(badge => {
      badge.textContent = wishlist.length;
      badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });

    document.querySelectorAll('[data-id]').forEach(card => {
      const id = card.dataset.id;
      const btn = card.querySelector('.pcard-wish, .pd-wish-btn');
      if (btn) {
        const isFav = wishlist.some(w => w.id === id);
        btn.classList.toggle('active', isFav);
      }
    });
  }

  function updateCartUI() {
    const cart = getCart();
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const shipping = subtotal > 150 || subtotal === 0 ? 0 : 12;
    const total = subtotal + shipping;

    // Badges
    document.querySelectorAll('.cart-count, .tb-badge').forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    // Drawer list
    const drawerList = document.querySelector('.cart-drawer-items');
    const drawerSubtotal = document.querySelector('.cd-subtotal');
    const drawerTotal = document.querySelector('.cd-total');
    const drawerFooter = document.querySelector('.cart-drawer-footer');

    if (drawerList) {
      if (cart.length === 0) {
        drawerList.innerHTML = `
          <div style="text-align:center; padding: 48px 0; color:var(--muted);">
            <p style="font-size:15px; font-weight:600; color:var(--ink); margin-bottom:6px;">Your cart is empty</p>
            <p style="font-size:12.5px; margin-bottom:18px;">Explore tools and technology for everyday living.</p>
            <a href="shop.html" class="btn btn-solid" style="font-size:11px; padding:10px 18px;">Browse Products</a>
          </div>
        `;
        if (drawerFooter) drawerFooter.style.display = 'none';
      } else {
        if (drawerFooter) drawerFooter.style.display = 'block';
        drawerList.innerHTML = cart.map(item => `
          <div class="cart-drawer-item">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <div class="cd-brand">${item.brand}</div>
              <div class="cd-name">${item.name}</div>
              <div class="cd-price">$${item.price}</div>
              <div style="display:flex; align-items:center; gap:8px; margin-top:6px;">
                <button type="button" class="btn-qty" data-id="${item.id}" data-action="dec" style="border:1px solid var(--line); width:22px; height:22px;">−</button>
                <span style="font-size:12px; font-weight:600;">${item.qty}</span>
                <button type="button" class="btn-qty" data-id="${item.id}" data-action="inc" style="border:1px solid var(--line); width:22px; height:22px;">+</button>
              </div>
            </div>
            <button type="button" class="btn-rem" data-id="${item.id}" style="font-size:11px; color:var(--muted); text-decoration:underline;">Remove</button>
          </div>
        `).join('');

        if (drawerSubtotal) drawerSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (drawerTotal) drawerTotal.textContent = `$${total.toFixed(2)}`;
      }
    }

    // Full Cart page (cart.html)
    const fullCart = document.querySelector('.full-cart-list');
    if (fullCart) {
      if (cart.length === 0) {
        fullCart.innerHTML = `
          <div class="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Discover our curated marketplace of design objects.</p>
            <a href="shop.html" class="btn btn-solid">Explore Catalog</a>
          </div>
        `;
        const sumBox = document.querySelector('.summary-box');
        if (sumBox) sumBox.style.display = 'none';
      } else {
        fullCart.innerHTML = cart.map(item => `
          <div class="cart-row">
            <img src="${item.image}" alt="${item.name}">
            <div>
              <div class="cr-brand">${item.brand}</div>
              <div class="cr-name">${item.name}</div>
              <button class="cr-remove btn-rem" data-id="${item.id}">Remove</button>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" class="btn-qty" data-id="${item.id}" data-action="dec" style="border:1px solid var(--line); width:24px; height:24px;">−</button>
              <span style="font-size:13px; font-weight:600;">${item.qty}</span>
              <button type="button" class="btn-qty" data-id="${item.id}" data-action="inc" style="border:1px solid var(--line); width:24px; height:24px;">+</button>
            </div>
            <div class="cr-price">$${(item.price * item.qty).toFixed(2)}</div>
          </div>
        `).join('');

        const pageSub = document.querySelector('.cart-subtotal');
        const pageTot = document.querySelector('.cart-total');
        if (pageSub) pageSub.textContent = `$${subtotal.toFixed(2)}`;
        if (pageTot) pageTot.textContent = `$${total.toFixed(2)}`;
      }
    }
  }

  function openCartDrawer() {
    const drawer = document.querySelector('.cart-drawer-overlay');
    if (drawer) {
      drawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    const drawer = document.querySelector('.cart-drawer-overlay');
    if (drawer) {
      drawer.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {

    // Search Suggestions Dropdown
    const searchInput = document.querySelector('.tb-search input');
    const searchDropdown = document.querySelector('.tb-search-dropdown');

    if (searchInput && searchDropdown) {
      searchInput.addEventListener('focus', () => {
        searchDropdown.classList.add('show');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.tb-search-container')) {
          searchDropdown.classList.remove('show');
        }
      });
    }

    // Mobile Category Drawer
    const catDrawer = document.querySelector('.cat-drawer');
    const catOverlay = document.querySelector('.cat-drawer-overlay');

    document.querySelectorAll('[data-cat-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (catDrawer && catOverlay) {
          catDrawer.classList.add('open');
          catOverlay.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    document.querySelectorAll('[data-cat-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (catDrawer && catOverlay) {
          catDrawer.classList.remove('open');
          catOverlay.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });

    // Cart Drawer Controls
    document.querySelectorAll('[data-cart-open], a[href="cart.html"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (window.location.pathname.endsWith('cart.html') || window.location.pathname.endsWith('checkout.html')) {
          return;
        }
        e.preventDefault();
        openCartDrawer();
      });
    });

    document.querySelectorAll('[data-cart-close]').forEach(btn => {
      btn.addEventListener('click', closeCartDrawer);
    });

    const drawerOverlay = document.querySelector('.cart-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) closeCartDrawer();
      });
    }

    // Cart Delegations
    document.addEventListener('click', (e) => {
      const rem = e.target.closest('.btn-rem');
      if (rem) {
        removeFromCart(rem.dataset.id);
        return;
      }

      const qtyBtn = e.target.closest('.btn-qty');
      if (qtyBtn) {
        updateQty(qtyBtn.dataset.id, qtyBtn.dataset.action === 'inc' ? 1 : -1);
      }
    });

    // Product Card "Add" Button
    document.querySelectorAll('.pcard-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.pcard');
        if (!card) return;

        addToCart({
          id: card.dataset.id || 'p-' + Math.random().toString(36).substr(2, 6),
          brand: card.dataset.brand || 'OBJECT MARKET',
          name: card.dataset.name || card.querySelector('.pcard-name')?.textContent || 'Object',
          price: card.dataset.price || '120',
          image: card.dataset.image || card.querySelector('img')?.src || ''
        });

        const orig = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.classList.add('added');
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('added');
        }, 1200);
      });
    });

    // Category Tabs Filter (Collection Two: Everyday Essentials)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.tab-row');
        row.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.dataset.cat;
        const gridId = row.dataset.target;
        const grid = document.getElementById(gridId);
        if (grid) {
          grid.querySelectorAll('.pcard').forEach(card => {
            if (cat === 'all' || card.dataset.cat === cat) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        }
      });
    });

    // Wishlist Button Toggle
    document.querySelectorAll('.pcard-wish, .pd-wish-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const card = btn.closest('.pcard, .pd-grid');
        const id = card?.dataset.id || 'item-' + Date.now();
        let wishlist = getWishlist();
        const idx = wishlist.findIndex(w => w.id === id);
        if (idx > -1) {
          wishlist.splice(idx, 1);
        } else {
          wishlist.push({
            id: id,
            brand: card?.dataset.brand || 'OBJECT MARKET',
            name: card?.dataset.name || card?.querySelector('.pcard-name, h1')?.textContent || 'Object',
            price: card?.dataset.price || '120',
            image: card?.dataset.image || card?.querySelector('img')?.src || ''
          });
        }
        saveWishlist(wishlist);
      });
    });

    // PDP Image Thumbnails
    document.querySelectorAll('.pd-thumbs img').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.pd-thumbs img').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const main = document.querySelector('.pd-main-img img');
        if (main) main.src = thumb.src;
      });
    });

    // PDP Accordions
    document.querySelectorAll('.pd-acc-head').forEach(head => {
      head.addEventListener('click', () => {
        const item = head.closest('.pd-accordion-item');
        if (item) item.classList.toggle('open');
      });
    });

    // PDP Add to Cart
    const pdpAdd = document.querySelector('.pd-actions .btn-solid');
    if (pdpAdd) {
      pdpAdd.addEventListener('click', () => {
        const grid = document.querySelector('.pd-grid');
        addToCart({
          id: grid?.dataset.id || 'pd-current',
          brand: document.querySelector('.pd-brand')?.textContent || 'Kiln & Co',
          name: document.querySelector('.pd-info h1')?.textContent || 'Articulated Task Lamp',
          price: document.querySelector('.pd-price')?.textContent.replace(/[^0-9.]/g, '') || '148',
          image: document.querySelector('.pd-main-img img')?.src || '',
          qty: 1
        });
        pdpAdd.textContent = 'Added to Cart ✓';
        setTimeout(() => { pdpAdd.textContent = 'Add to Cart'; }, 1400);
      });
    }

    updateCartUI();
    updateWishlistUI();
  });

  window.ObjectMarket = {
    addToCart,
    removeFromCart,
    openCartDrawer,
    closeCartDrawer
  };

})();
