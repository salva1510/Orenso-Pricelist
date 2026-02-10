let isAdmin = false;
let basket = {}; 
let currentLiveItems = [];

const ADMIN_PHONE = "639153290207"; 
const FB_USERNAME = "kram.samot.2024"; 
const JSON_URL = 'products.json'; 

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        isAdmin = true;
        applyAdminUI();
    }
    loadData();
});

async function loadData() {
    try {
        const res = await fetch(JSON_URL + '?nocache=' + new Date().getTime());
        currentLiveItems = await res.json();
        displayItems(currentLiveItems);
        setupCarousel(currentLiveItems);
    } catch (e) { console.error("Error loading JSON:", e); }
}

function displayItems(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map((item, index) => {
        const statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        return `
            <div class="product-card" data-name="${item.name}">
                <img src="${item.image}" onclick="openProductView(${index})" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                <div onclick="openProductView(${index})">
                    <span class="status-badge ${statusClass}">${item.status}</span>
                    <h4>${item.name}</h4>
                    <div class="product-price">₱${(item.pricePiece || 0).toLocaleString()} / pc</div>
                </div>
                <div class="card-btns">
                    ${isAdmin ? `<button onclick="deleteItem(${index})" style="background:#ff4757; color:white; border:none; padding:5px; border-radius:5px;">Delete</button>` : 
                    `
                        <button class="opt-btn btn-pc" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece')">+ Piece</button>
                        <button class="opt-btn btn-box" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box')">+ Box</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function addToBasket(name, price, type) {
    const key = `${name} (${type})`;
    if (basket[key]) { basket[key].count += 1; } 
    else { basket[key] = { price: price, count: 1, type: type, originalName: name }; }
    
    // Subtle Vibration feedback for mobile
    if(navigator.vibrate) navigator.vibrate(50);
    
    updateBasketCount();
    document.getElementById('basketFloat').style.display = 'flex';
}

function updateBasketCount() {
    let total = 0;
    for (let k in basket) { total += basket[k].count; }
    document.getElementById('basketCount').innerText = total;
    if (total === 0) document.getElementById('basketFloat').style.display = 'none';
}

// ... (retain existing openProductView, renderBasket, sendOrder functions from your script.js)

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let cards = document.getElementsByClassName('product-card');
    for (let card of cards) {
        card.style.display = card.getAttribute('data-name').toUpperCase().includes(val) ? "flex" : "none";
    }
}

// Panatilihin ang toggleAdmin, applyAdminUI, deleteItem, at copyNewJSON functions mo.
function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    const statusText = document.getElementById('adminStatus');
    statusText.innerText = "Admin Mode";
    statusText.style.color = "#2ecc71";
    document.getElementById('loginBtn').innerText = "Logout";
    document.getElementById('loginBtn').style.background = "#dc3545";
                                         }
      
