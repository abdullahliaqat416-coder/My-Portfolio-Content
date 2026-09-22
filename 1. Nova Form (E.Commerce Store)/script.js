/* =========================================================
   NOVA FORM — Interactive Behavior & State Management
========================================================= */

(function() {
  'use strict';

  // --- Cart State Management (localStorage) ---
  const CART_STORAGE_KEY = 'nova_form_cart_v1';
  const WISHLIST_STORAGE_KEY = 'nova_form_wishlist_v1';

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch(e) {}
    updateCartUI();
  }

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY)) || [];
    } catch(e) {
      return [];
    }
  }

  function saveWishlist(wishlist) {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch(e) {}
    updateWishlistUI();
  }

  function addToCart(item) {
    const cart = getCart();
    const existingIndex = cart.findIndex(i => i.id === item.id && i.size === item.size);
    if (existingIndex > -1) {
      cart[existingIndex].qty += (item.qty || 1);
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        size: item.size || 'M',
        desc: item.desc || '',
        qty: item.qty || 1
      });
    }
    saveCart(cart);
    openCartDrawer();
  }

  function removeFromCart(id, size) {
    let cart = getCart();
    cart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart(cart);
  }

  function updateItemQty(id, size, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id && i.size === size);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        removeFromCart(id, size);
        return;
      }
      saveCart(cart);
    }
  }

  function toggleWishlist(item) {
    let wishlist = getWishlist();
    const index = wishlist.findIndex(w => w.id === item.id);
    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      wishlist.push(item);
    }
    saveWishlist(wishlist);
    return index === -1; // true if added, false if removed
  }

  function updateWishlistUI() {
    const wishlist = getWishlist();
    const badges = document.querySelectorAll('.wishlist-count');
    badges.forEach(b => {
      b.textContent = wishlist.length;
      b.style.display = wishlist.length > 0 ? 'flex' : 'none';
    });

    // Update heart icons on cards
    document.querySelectorAll('[data-product-id]').forEach(card => {
      const id = card.dataset.productId;
      const btn = card.querySelector('.p-wishlist, .wishlist-btn');
      if (btn) {
        const isFavorited = wishlist.some(w => w.id === id);
        btn.classList.toggle('active', isFavorited);
      }
    });
  }

  function updateCartUI() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shipping = subtotal > 200 || subtotal === 0 ? 0 : 15;
    const total = subtotal + shipping;

    // Badges
    document.querySelectorAll('.bag-count, .cart-count').forEach(badge => {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    });

    // Drawer list
    const drawerItemsContainer = document.querySelector('.cart-drawer-items');
    const drawerSubtotal = document.querySelector('.cd-subtotal');
    const drawerShipping = document.querySelector('.cd-shipping');
    const drawerTotal = document.querySelector('.cd-total');
    const drawerFooter = document.querySelector('.cart-drawer-footer');

    if (drawerItemsContainer) {
      if (cart.length === 0) {
        drawerItemsContainer.innerHTML = `
          <div class="cart-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>
            </svg>
            <p style="font-family:var(--font-serif); font-size:20px; color:var(--charcoal); margin-bottom:8px;">Your bag is empty</p>
            <p style="font-size:13px; color:var(--taupe); margin-bottom:20px;">Explore our new arrivals and timeless essentials.</p>
            <a href="shop.html" class="btn btn-dark" style="font-size:11px; padding:12px 24px;">Start Shopping</a>
          </div>
        `;
        if (drawerFooter) drawerFooter.style.display = 'none';
      } else {
        if (drawerFooter) drawerFooter.style.display = 'block';
        drawerItemsContainer.innerHTML = cart.map(item => `
          <div class="cart-drawer-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cd-info">
              <span class="cd-name">${item.name}</span>
              <span class="cd-variant">Size: ${item.size}</span>
              <span class="cd-price">$${item.price}</span>
              <div class="cd-stepper">
                <button type="button" class="cd-qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size}">−</button>
                <span>${item.qty}</span>
                <button type="button" class="cd-qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size}">+</button>
              </div>
            </div>
            <button type="button" class="cd-remove" data-id="${item.id}" data-size="${item.size}">Remove</button>
          </div>
        `).join('');

        if (drawerSubtotal) drawerSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (drawerShipping) drawerShipping.textContent = shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`;
        if (drawerTotal) drawerTotal.textContent = `$${total.toFixed(2)}`;
      }
    }

    // Full Cart Page (if on cart.html)
    const fullCartContainer = document.querySelector('.full-cart-items');
    if (fullCartContainer) {
      if (cart.length === 0) {
        fullCartContainer.innerHTML = `
          <div class="cart-empty-state" style="padding: 100px 0;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>
            </svg>
            <h3 style="font-family:var(--font-serif); font-size:28px; margin-bottom:12px;">Your shopping bag is empty</h3>
            <p style="color:var(--taupe); margin-bottom:28px;">Discover our collection of considered essentials.</p>
            <a href="shop.html" class="btn btn-dark">Explore New Arrivals</a>
          </div>
        `;
        const summaryBox = document.querySelector('.summary-box');
        if (summaryBox) summaryBox.style.display = 'none';
      } else {
        fullCartContainer.innerHTML = cart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="ci-details">
              <div class="ci-name">${item.name}</div>
              <div class="ci-variant">Size: ${item.size}</div>
              <button class="ci-remove cd-remove" data-id="${item.id}" data-size="${item.size}">Remove</button>
            </div>
            <div class="cd-stepper">
              <button type="button" class="cd-qty-btn" data-action="dec" data-id="${item.id}" data-size="${item.size}">−</button>
              <span>${item.qty}</span>
              <button type="button" class="cd-qty-btn" data-action="inc" data-id="${item.id}" data-size="${item.size}">+</button>
            </div>
            <div class="ci-price">$${(item.price * item.qty).toFixed(2)}</div>
          </div>
        `).join('');

        const pageSubtotal = document.querySelector('.cart-summary-subtotal');
        const pageShipping = document.querySelector('.cart-summary-shipping');
        const pageTotal = document.querySelector('.cart-summary-total');
        if (pageSubtotal) pageSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (pageShipping) pageShipping.textContent = shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)}`;
        if (pageTotal) pageTotal.textContent = `$${total.toFixed(2)}`;
      }
    }
  }

  function openCartDrawer() {
    const drawerOverlay = document.querySelector('.cart-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeCartDrawer() {
    const drawerOverlay = document.querySelector('.cart-drawer-overlay');
    if (drawerOverlay) {
      drawerOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // --- Document Ready Initializations ---
  document.addEventListener('DOMContentLoaded', () => {

    // 1. Header scroll effect
    const header = document.querySelector('.site-header');
    if (header) {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    // 2. Full-width Search Overlay
    const searchOverlay = document.querySelector('.search-overlay');
    const searchInput = document.querySelector('.search-input-wrap input');

    document.querySelectorAll('[data-search-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (searchOverlay) {
          searchOverlay.classList.add('active');
          document.body.style.overflow = 'hidden';
          setTimeout(() => { if (searchInput) searchInput.focus(); }, 100);
        }
      });
    });

    document.querySelectorAll('[data-search-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (searchOverlay) {
          searchOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (searchOverlay && searchOverlay.classList.contains('active')) {
          searchOverlay.classList.remove('active');
          document.body.style.overflow = '';
        }
        closeCartDrawer();
        closeMobileDrawer();
      }
    });

    // 3. Mobile Nav Drawer
    const mobileDrawer = document.querySelector('.mobile-nav-drawer');
    const mobileDrawerOverlay = document.querySelector('.mobile-drawer-overlay');

    function openMobileDrawer() {
      if (mobileDrawer && mobileDrawerOverlay) {
        mobileDrawer.classList.add('open');
        mobileDrawerOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeMobileDrawer() {
      if (mobileDrawer && mobileDrawerOverlay) {
        mobileDrawer.classList.remove('open');
        mobileDrawerOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    }

    document.querySelectorAll('[data-mobile-menu-open]').forEach(btn => {
      btn.addEventListener('click', openMobileDrawer);
    });

    document.querySelectorAll('[data-mobile-menu-close]').forEach(btn => {
      btn.addEventListener('click', closeMobileDrawer);
    });

    if (mobileDrawerOverlay) {
      mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);
    }

    // 4. Cart Drawer Listeners
    document.querySelectorAll('[data-cart-open]').forEach(btn => {
      btn.addEventListener('click', (e) => {
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

    // Event delegation for cart item actions (stepper & remove)
    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.cd-remove');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        const size = removeBtn.dataset.size;
        removeFromCart(id, size);
        return;
      }

      const qtyBtn = e.target.closest('.cd-qty-btn');
      if (qtyBtn) {
        const id = qtyBtn.dataset.id;
        const size = qtyBtn.dataset.size;
        const action = qtyBtn.dataset.action;
        updateItemQty(id, size, action === 'inc' ? 1 : -1);
      }
    });

    // 5. Quick Add on Product Cards
    document.querySelectorAll('.p-card').forEach(card => {
      const sizeBtns = card.querySelectorAll('.qa-size');
      const addBtn = card.querySelector('.qa-add-btn');
      let selectedSize = 'M'; // default size

      sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          sizeBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSize = btn.textContent.trim();
          if (addBtn) addBtn.disabled = false;
        });
      });

      if (addBtn) {
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const item = {
            id: card.dataset.id || card.dataset.productId || 'item-' + Math.random().toString(36).substr(2, 6),
            name: card.dataset.name || card.querySelector('.p-name')?.textContent || 'Product',
            price: card.dataset.price || '180',
            image: card.dataset.image || card.querySelector('.p-media img')?.src || '',
            size: selectedSize,
            qty: 1
          };
          addToCart(item);

          const originalText = addBtn.textContent;
          addBtn.textContent = 'Added ✓';
          addBtn.classList.add('added');
          setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.classList.remove('added');
          }, 1500);
        });
      }
    });

    // 6. Wishlist Toggles
    document.addEventListener('click', (e) => {
      const wishBtn = e.target.closest('.p-wishlist, .wishlist-btn');
      if (wishBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = wishBtn.closest('.p-card, .pdp-layout') || document.body;
        const item = {
          id: card.dataset.id || card.dataset.productId || 'p-' + Date.now(),
          name: card.dataset.name || card.querySelector('.p-name, h1')?.textContent || 'Product',
          price: card.dataset.price || '180',
          image: card.dataset.image || card.querySelector('img')?.src || ''
        };
        toggleWishlist(item);
      }
    });

    // 7. Newsletter Form Validation
    const nlForm = document.querySelector('.newsletter-form');
    if (nlForm) {
      nlForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = nlForm.querySelector('input[type="email"]');
        const msg = document.querySelector('.nl-msg');
        if (!input || !msg) return;

        const email = input.value.trim();
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!valid) {
          msg.textContent = 'Please enter a valid email.';
          msg.className = 'nl-msg error';
        } else {
          msg.textContent = "You're on the list.";
          msg.className = 'nl-msg success';
          input.value = '';
          setTimeout(() => {
            msg.className = 'nl-msg';
            msg.textContent = '';
          }, 4000);
        }
      });
    }

    // 8. PDP Gallery Thumbnails & Accordions
    document.querySelectorAll('.pdp-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.pdp-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const mainImg = document.querySelector('.pdp-main-image img');
        const newSrc = thumb.querySelector('img')?.src;
        if (mainImg && newSrc) {
          mainImg.src = newSrc;
        }
      });
    });

    document.querySelectorAll('.accordion-head').forEach(head => {
      head.addEventListener('click', () => {
        const item = head.closest('.accordion-item');
        if (item) {
          item.classList.toggle('open');
        }
      });
    });

    // 9. PDP Size Selector & Add to Bag
    document.querySelectorAll('.pdp-size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const pdpAddBagBtn = document.querySelector('.pdp-add-bag');
    if (pdpAddBagBtn) {
      pdpAddBagBtn.addEventListener('click', () => {
        const activeSizeBtn = document.querySelector('.pdp-size-btn.active');
        const selectedSize = activeSizeBtn ? activeSizeBtn.textContent.trim() : 'M';
        const name = document.querySelector('.pdp-info-panel h1')?.textContent.trim() || 'Form Wool Overshirt';
        const price = document.querySelector('.pdp-price')?.textContent.replace(/[^0-9.]/g, '') || '189';
        const img = document.querySelector('.pdp-main-image img')?.src || '';

        addToCart({
          id: 'pdp-' + name.toLowerCase().replace(/\s+/g, '-'),
          name: name,
          price: parseFloat(price),
          image: img,
          size: selectedSize,
          qty: 1
        });

        pdpAddBagBtn.textContent = 'Added to Bag ✓';
        setTimeout(() => {
          pdpAddBagBtn.textContent = 'Add to Bag';
        }, 1500);
      });
    }

    // 10. Interactive Three.js 3D WebGL Canvas
    function initHero3D() {
      const canvas = document.getElementById('hero-3d-canvas');
      if (!canvas || typeof THREE === 'undefined') return;

      const scene = new THREE.Scene();
      const parent = canvas.parentElement;
      const width = parent.clientWidth || window.innerWidth;
      const height = parent.clientHeight || window.innerHeight;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 6;

      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0x7088ff, 2.5);
      dirLight1.position.set(5, 5, 5);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xd4af37, 2.0);
      dirLight2.position.set(-5, -5, 3);
      scene.add(dirLight2);

      const pointLight = new THREE.PointLight(0x00f2fe, 1.8, 50);
      pointLight.position.set(0, 2, 4);
      scene.add(pointLight);

      // Organic Architectural Luxury Torus Knot Geometry
      const geometry = new THREE.TorusKnotGeometry(1.35, 0.36, 180, 36, 2, 3);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x141829,
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95,
        wireframe: false
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Wireframe overlay for cyber-luxury atelier aesthetic
      const wireGeometry = new THREE.TorusKnotGeometry(1.37, 0.37, 60, 16, 2, 3);
      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x7088ff,
        wireframe: true,
        transparent: true,
        opacity: 0.18
      });
      const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
      scene.add(wireMesh);

      // Ambient Floating Particles
      const particleCount = 180;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 16;
        positions[i + 1] = (Math.random() - 0.5) * 16;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x7088ff,
        size: 0.035,
        transparent: true,
        opacity: 0.65
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Mouse reactivity tracking
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      const windowHalfX = window.innerWidth / 2;
      const windowHalfY = window.innerHeight / 2;

      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - windowHalfX) * 0.0012;
        mouseY = (e.clientY - windowHalfY) * 0.0012;
      });

      function onResize() {
        if (!canvas || !canvas.parentElement) return;
        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
      window.addEventListener('resize', onResize);

      function animate() {
        requestAnimationFrame(animate);

        targetX += (mouseX - targetX) * 0.05;
        targetY += (mouseY - targetY) * 0.05;

        mesh.rotation.x += 0.004;
        mesh.rotation.y += 0.006;
        mesh.rotation.x += (targetY - mesh.rotation.x * 0.1) * 0.08;
        mesh.rotation.y += (targetX - mesh.rotation.y * 0.1) * 0.08;

        wireMesh.rotation.x = mesh.rotation.x;
        wireMesh.rotation.y = mesh.rotation.y;

        particles.rotation.y += 0.0008;
        particles.rotation.x += 0.0005;

        renderer.render(scene, camera);
      }
      animate();
    }

    // 11. 3D Card Physics & Interactive Tilt
    function init3DCardPhysics() {
      const cards = document.querySelectorAll('.p-card');
      cards.forEach(card => {
        const media = card.querySelector('.p-media');
        if (!media) return;

        if (!media.querySelector('.card-glare')) {
          const glare = document.createElement('div');
          glare.className = 'card-glare';
          media.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -8;
          const rotateY = ((x - centerX) / centerX) * 8;

          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;

          media.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
          media.style.setProperty('--mouse-x', `${glareX}%`);
          media.style.setProperty('--mouse-y', `${glareY}%`);
        });

        card.addEventListener('mouseleave', () => {
          media.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
          media.style.setProperty('--mouse-x', '50%');
          media.style.setProperty('--mouse-y', '50%');
        });
      });
    }

    // 12. Architectural Left Side Spine Scroll Progress
    function initSideSpine() {
      const progressBar = document.querySelector('.spine-progress-bar');
      const milestone = document.querySelector('.spine-milestone');
      if (!progressBar && !milestone) return;

      function updateSpine() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) : 0;
        const percentage = Math.min(Math.max(progress * 100, 10), 100);

        if (progressBar) {
          progressBar.style.height = percentage + '%';
        }

        if (milestone) {
          const sections = document.querySelectorAll('section, header, footer');
          const totalSections = Math.max(sections.length, 6);
          const currentSection = Math.min(Math.floor(progress * totalSections) + 1, totalSections);
          milestone.textContent = `0${currentSection} / 0${totalSections}`;
        }
      }

      window.addEventListener('scroll', updateSpine, { passive: true });
      updateSpine();
    }

    // Initialize UI from localStorage & 3D Features
    updateCartUI();
    updateWishlistUI();
    initHero3D();
    init3DCardPhysics();
    initSideSpine();
  });

  // Expose helpers globally if needed
  window.NovaForm = {
    addToCart,
    removeFromCart,
    openCartDrawer,
    closeCartDrawer,
    toggleWishlist
  };

})();
