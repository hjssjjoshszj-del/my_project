// ========== DOM ELEMENTLARI ==========
const navbar = document.querySelector('.navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const orderBtn = document.getElementById('orderBtn');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartNotification = document.getElementById('cartNotification');
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const currentYear = document.getElementById('currentYear');
const menuCards = document.querySelectorAll('.menu-card');
const aboutContent = document.querySelector('.about-content');
const aboutImage = document.querySelector('.about-image');
const navLinks = document.querySelectorAll('.nav-link');

// ========== YANGI CART ELEMENTLARI ==========
const cartModal = document.getElementById('cartModal');
const closeCartModal = document.getElementById('closeCartModal');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const emptyCart = document.getElementById('emptyCart');
const cartSummary = document.getElementById('cartSummary');
const totalPrice = document.getElementById('totalPrice');
const continueShopping = document.getElementById('continueShopping');
const checkoutBtn = document.getElementById('checkoutBtn');

// ========== GLOBAL O'ZGARUVCHILAR ==========
let cartItems = [];
let cartTotal = 0;

// ========== SAYT YUKLANGANDA ISHLASH ==========
document.addEventListener('DOMContentLoaded', function() {
    // Joriy yilni footer'ga qo'yish
    currentYear.textContent = new Date().getFullYear();
    
    // LocalStorage'dan cart ma'lumotlarini yuklash
    loadCartFromStorage();
    
    // Scroll animatsiyalari uchun elementlarni kuzatish
    initScrollAnimations();
    
    // Scroll bo'lganda navbar'ni o'zgartirish
    window.addEventListener('scroll', handleScroll);
    
    // Boshlang'ich animatsiyalar
    setTimeout(() => {
        document.querySelector('.hero-title').style.opacity = '1';
        document.querySelector('.hero-subtitle').style.opacity = '1';
        document.querySelector('.animate-fade-up-delay-2').style.opacity = '1';
    }, 100);
    
    // Cart modal event listener'lar
    initCartModal();
});

// ========== NAVBAR SCROLL LOGIKASI ==========
function handleScroll() {
    // Navbar background o'zgarishi
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Scroll animatsiyalari
    handleScrollAnimations();
}

// ========== HAMBURGER MENU TOGGLE ==========
hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Mobile menyu ochiq bo'lsa, body scroll'ni o'chirish
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
});

// Mobile menyudagi linklar bosilganda menyu yopilishi
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// ========== CART MODAL FUNKSIYALARI ==========
function initCartModal() {
    // Cart button bosilganda modal ochish
    cartBtn.addEventListener('click', openCartModal);
    
    // Modal yopish
    closeCartModal.addEventListener('click', closeCartModalFunc);
    continueShopping.addEventListener('click', closeCartModalFunc);
    
    // Modal tashqarisiga bosilganda yopish
    cartModal.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            closeCartModalFunc();
        }
    });
    
    // Checkout button bosilganda
    checkoutBtn.addEventListener('click', function() {
        if (cartItems.length === 0) {
            showAlert('Your cart is empty. Add some items first!', 'warning');
            return;
        }
        
        showAlert(`Checkout successful! Total: $${cartTotal.toFixed(2)}`, 'success');
        clearCart();
        closeCartModalFunc();
    });
}

function openCartModal() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartDisplay();
}

function closeCartModalFunc() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========== SAVATCHA FUNKSIYALARI ==========
// Add to Cart tugmalari uchun event listener
addToCartButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        addToCart(this);
    });
});

// Order Now tugmasi
orderBtn.addEventListener('click', function() {
    // Eng birinchi burger'ni savatchaga qo'shish
    if (addToCartButtons.length > 0) {
        addToCart(addToCartButtons[0]);
        
        // Menu bo'limiga scroll qilish
        document.getElementById('menu').scrollIntoView({
            behavior: 'smooth'
        });
    }
});

// Mahsulotni savatchaga qo'shish funksiyasi
function addToCart(button) {
    const itemId = button.getAttribute('data-id') || generateItemId();
    const itemName = button.getAttribute('data-item');
    const itemPrice = parseFloat(button.getAttribute('data-price'));
    const itemImage = button.closest('.menu-card').querySelector('img').src;
    
    // Cart sonini oshirish
    const existingItemIndex = cartItems.findIndex(item => item.id === itemId);
    
    if (existingItemIndex > -1) {
        // Agar mahsulot allaqachon savatda bo'lsa, miqdorini oshiramiz
        cartItems[existingItemIndex].quantity += 1;
    } else {
        // Yangi mahsulot qo'shamiz
        cartItems.push({
            id: itemId,
            name: itemName,
            price: itemPrice,
            image: itemImage,
            quantity: 1
        });
    }
    
    // Cart yangilash
    updateCart();
    
    // Button ripple effect
    createRippleEffect(button);
    
    // Button pulse animation
    button.classList.add('pulse');
    setTimeout(() => {
        button.classList.remove('pulse');
    }, 600);
    
    // Notification ko'rsatish
    showCartNotification(itemName);
}

// Random ID yaratish
function generateItemId() {
    return 'item_' + Math.random().toString(36).substr(2, 9);
}

// Cartni yangilash
function updateCart() {
    // Cart sonini hisoblash
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Cart umumiy narxini hisoblash
    cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Cart display yangilash
    if (cartModal.classList.contains('active')) {
        updateCartDisplay();
    }
    
    // LocalStorage'ga saqlash
    saveCartToStorage();
    
    // Cart icon animation
    cartBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
    }, 300);
}

// Cart display yangilash
function updateCartDisplay() {
    // Agar savat bo'sh bo'lsa
    if (cartItems.length === 0) {
        emptyCart.style.display = 'flex';
        cartSummary.style.display = 'none';
        return;
    }
    
    // Agar savat bo'sh bo'lmasa
    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';
    
    // Cart items container'ni tozalash
    cartItemsContainer.innerHTML = '';
    
    // Har bir mahsulotni cart'ga qo'shish
    cartItems.forEach((item, index) => {
        const cartItemElement = createCartItemElement(item, index);
        cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Total narxni yangilash
    totalPrice.textContent = `$${cartTotal.toFixed(2)}`;
}

// Cart item element yaratish
function createCartItemElement(item, index) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.setAttribute('data-index', index);
    
    cartItem.innerHTML = `
        <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
            <h3 class="cart-item-title">${item.name}</h3>
            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn increase-btn">+</button>
                </div>
                <button class="remove-item">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `;
    
    // Event listener'lar qo'shish
    const decreaseBtn = cartItem.querySelector('.decrease-btn');
    const increaseBtn = cartItem.querySelector('.increase-btn');
    const removeBtn = cartItem.querySelector('.remove-item');
    
    decreaseBtn.addEventListener('click', () => updateQuantity(index, -1));
    increaseBtn.addEventListener('click', () => updateQuantity(index, 1));
    removeBtn.addEventListener('click', () => removeItem(index));
    
    return cartItem;
}

// Mahsulot miqdorini o'zgartirish
function updateQuantity(index, change) {
    const item = cartItems[index];
    
    if (change === -1 && item.quantity === 1) {
        // Agar miqdor 1 bo'lsa va minus bosilsa, mahsulotni o'chiramiz
        removeItem(index);
        return;
    }
    
    item.quantity += change;
    updateCart();
}

// Mahsulotni savatdan o'chirish
function removeItem(index) {
    const cartItemElement = document.querySelector(`.cart-item[data-index="${index}"]`);
    
    // Animatsiya qo'shamiz
    cartItemElement.classList.add('removing');
    
    setTimeout(() => {
        cartItems.splice(index, 1);
        updateCart();
        updateCartDisplay(); // Display yangilash
    }, 300);
}

// Cartni tozalash
function clearCart() {
    cartItems = [];
    updateCart();
}

// Ripple effect yaratish
function createRippleEffect(button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Cart notification ko'rsatish
function showCartNotification(itemName) {
    const notification = cartNotification;
    notification.querySelector('span').textContent = `${itemName} added to cart!`;
    
    // Notification ko'rsatish
    notification.classList.add('show');
    
    // 2.5 sekunddan keyin yashirish
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2500);
}

// ========== LOCAL STORAGE FUNKSIYALARI ==========
function saveCartToStorage() {
    localStorage.setItem('burgerCart', JSON.stringify(cartItems));
    localStorage.setItem('cartTotal', cartTotal.toString());
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('burgerCart');
    const savedTotal = localStorage.getItem('cartTotal');
    
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        
        // Cart sonini yangilash
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Cart umumiy narxini yangilash
        if (savedTotal) {
            cartTotal = parseFloat(savedTotal);
        } else {
            cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
    }
}

// ========== CONTACT FORM VALIDATION ==========
contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Form maydonlari
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    
    // Xatolik elementlari
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    
    // Validatsiya flag'i
    let isValid = true;
    
    // Name validatsiya
    if (name.value.trim() === '') {
        nameError.textContent = 'Name is required';
        name.style.borderColor = '#e63946';
        isValid = false;
    } else {
        nameError.textContent = '';
        name.style.borderColor = '#ddd';
    }
    
    // Email validatsiya
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === '') {
        emailError.textContent = 'Email is required';
        email.style.borderColor = '#e63946';
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        emailError.textContent = 'Please enter a valid email';
        email.style.borderColor = '#e63946';
        isValid = false;
    } else {
        emailError.textContent = '';
        email.style.borderColor = '#ddd';
    }
    
    // Message validatsiya
    if (message.value.trim() === '') {
        messageError.textContent = 'Message is required';
        message.style.borderColor = '#e63946';
        isValid = false;
    } else {
        messageError.textContent = '';
        message.style.borderColor = '#ddd';
    }
    
    // Agar form to'g'ri to'ldirilgan bo'lsa
    if (isValid) {
        // Success animatsiya
        formSuccess.classList.add('show');
        
        // Formani tozalash
        contactForm.reset();
        
        // 5 sekunddan keyin success xabarini yashirish
        setTimeout(() => {
            formSuccess.classList.remove('show');
        }, 5000);
    }
});

// ========== SCROLL ANIMATION FUNCTIONS ==========
function initScrollAnimations() {
    // Intersection Observer - menu cards
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Menu card'lar uchun observer
    menuCards.forEach(card => {
        observer.observe(card);
    });
    
    // About section uchun observer
    if (aboutContent) observer.observe(aboutContent);
    if (aboutImage) observer.observe(aboutImage);
}

function handleScrollAnimations() {
    // About section slide animatsiyalari
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
        const aboutSectionTop = aboutSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (aboutSectionTop < windowHeight * 0.75) {
            aboutContent.classList.add('visible');
            aboutImage.classList.add('visible');
        }
    }
    
    // Menu card'lar uchun oddiy scroll animatsiya
    const menuSection = document.querySelector('.menu-section');
    if (menuSection) {
        const menuSectionTop = menuSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (menuSectionTop < windowHeight * 0.8) {
            menuCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 100);
            });
        }
    }
}

// ========== YORDAMCHI FUNKSIYALAR ==========
function showAlert(message, type = 'info') {
    // Chiroyli alert yaratish
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert ${type}`;
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style qo'shamiz
    const alertStyle = document.createElement('style');
    alertStyle.textContent = `
        .custom-alert {
            position: fixed;
            top: 100px;
            right: 30px;
            background-color: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 15px;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 3s forwards;
        }
        .custom-alert.warning {
            background-color: #ff9800;
        }
        .custom-alert.info {
            background-color: #2196F3;
        }
        .custom-alert i {
            font-size: 20px;
        }
    `;
    
    document.head.appendChild(alertStyle);
    document.body.appendChild(alertDiv);
    
    // 3 sekunddan keyin o'chirish
    setTimeout(() => {
        alertDiv.remove();
        alertStyle.remove();
    }, 3300);
}

// ========== QO'SHIMCHA CSS (RIPPLE EFFECT UCHUN) ==========
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.7);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .pulse {
        animation: pulse 0.6s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// ========== SMOOTH SCROLL ANCHOR LINKS ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ========== NAV LINK ACTIVE STATE ==========
window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 100)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});