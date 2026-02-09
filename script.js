let isAdmin = false;
let basket = {}; // Format: { "Product Name - Box": {price: 1500, count: 1, type: "Box"} }
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
    } catch (e) { console.error(e); }
}

function setupCarousel(items) {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    const displayList = [...items, ...items, ...items]; 
    track.innerHTML = displayList.map(item => `
        <div class="carousel-item">
            <img src="${item.image || 'https://via.placeholder.com/60'}">
            <p>${item.name}</p>
        </div>
    `).join('');
}

function displayItems(items) {
    let tableBody = document.getElementById('productBody');
    tableBody.innerHTML = '';
    items.forEach((item, index) => {
        let statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        
        // ADMIN VIEW vs CUSTOMER VIEW
        let actionContent = isAdmin ? 
            `<button onclick="deleteItem(${index})" style="color:red; background:none; font-size:20px; border:none;">&times;</button>` :
            `<div class="order-options">
                <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece')">Tingi<br>₱${item.pricePiece}</button>
                <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box')">Box<br>₱${item.priceBox}</button>
            </div>`;

        tableBody.innerHTML += `
            <tr>
                <td><img src="${item.image || 'https://via.placeholder.com/60'}" class="product-img" onclick="openProductView(${index})"></td>
                <td onclick="openProductView(${index})" style="cursor:pointer;">
                    <strong>${item.name}</strong><br>
                    <span class="status-badge ${statusClass}">${item.status}</span><br>
                    <small>${item.qty || ''}</small>
                </td>
                <td style="font-size:11px; color:#28a745">P:${item.pricePiece}<br>B:${item.priceBox}</td>
                <td>${actionContent}</td>
            </tr>`;
    });
}

function addToBasket(name, price, type) {
    const basketKey = `${name} (${type})`;
    if (basket[basketKey]) {
        basket[basketKey].count += 1;
    } else {
        basket[basketKey] = { price: price, count: 1, type: type, originalName: name };
    }
    updateBasketCount();
    document.getElementById('basketFloat').style.display = 'flex';
    
    // Notification effect (Optional)
    console.log(`Added ${basketKey} to basket`);
}

function removeFromBasket(basketKey) {
    if (basket[basketKey]) {
        basket[basketKey].count -= 1;
        if (basket[basketKey].count <= 0) delete basket[basketKey];
    }
    updateBasketCount();
    renderBasket();
}

function updateBasketCount() {
    let totalItems = 0;
    for (let key in basket) { totalItems += basket[key].count; }
    document.getElementById('basketCount').innerText = totalItems;
    if (totalItems === 0) document.getElementById('basketFloat').style.display = 'none';
}

function renderBasket() {
    const list = document.getElementById('basketList');
    let total = 0;
    let html = "";
    for (let key in basket) {
        let item = basket[key];
        let subtotal = item.price * item.count;
        total += subtotal;
        html += `<div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
            <div style="flex:1;"><span style="font-size:14px; font-weight:bold;">${key}</span><br><small>₱${item.price.toLocaleString()}</small></div>
            <div style="display:flex; align-items:center;">
                <button class="qty-btn" onclick="removeFromBasket('${key}')">-</button>
                <span style="width:20px; text-align:center;">${item.count}</span>
                <button class="qty-btn" onclick="addToBasket('${item.originalName}', ${item.price}, '${item.type}'); renderBasket();">+</button>
                <span style="margin-left:10px; font-weight:bold; width:70px; text-align:right;">₱${subtotal.toLocaleString()}</span>
            </div>
        </div>`;
    }
    list.innerHTML = html || "<p style='text-align:center; color:#999;'>Walang laman ang basket.</p>";
    document.getElementById('basketTotal').innerText = "₱" + total.toLocaleString();
}

function sendOrder(platform) {
    const name = document.getElementById('customerName').value;
    const contact = document.getElementById('customerContact').value;
    const address = document.getElementById('customerAddress').value;
    const landmark = document.getElementById('customerLandmark').value;
    const payment = document.getElementById('paymentMethod').value;

    if(!name || !contact || !address) return alert("Paki-puno ang Name, Contact, at Address!");
    if(Object.keys(basket).length === 0) return alert("Walang laman ang basket.");
    
    let msg = `*BAGONG ORDER (VIA LALAMOVE)*\n`;
    msg += `👤 Name: ${name.toUpperCase()}\n`;
    msg += `📞 Contact: ${contact}\n`;
    msg += `📍 Address: ${address}\n`;
    msg += `🏠 Landmark: ${landmark || 'N/A'}\n`;
    msg += `💳 Payment: ${payment}\n`;
    msg += `----------\n`;
    
    let total = 0;
    for (let key in basket) {
        let item = basket[key];
        let subtotal = item.price * item.count;
        msg += `- ${key} x ${item.count} = ₱${subtotal.toLocaleString()}\n`;
        total += subtotal;
    }
    msg += `----------\n*TOTAL: ₱${total.toLocaleString()}*`;
    
    if(platform === 'whatsapp') {
        window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`);
    } else {
        navigator.clipboard.writeText(msg).then(() => {
            alert("Order Details Copied! I-paste sa Messenger.");
            window.open(`https://m.me/${FB_USERNAME}`);
        });
    }
}

// Iba pang functions (openProductView, toggleAdmin, etc.) ay mananatili ang orihinal na logic
function toggleAdmin() {
    if (!isAdmin) { if (prompt("Pass:") === "123") { localStorage.setItem('adminLoggedIn', 'true'); location.reload(); } }
    else { localStorage.removeItem('adminLoggedIn'); location.reload(); }
}

function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    document.getElementById('loginBtn').innerText = "Logout";
    document.getElementById('loginBtn').style.background = "#dc3545";
}

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let rows = document.getElementById('productBody').getElementsByTagName('tr');
    for (let row of rows) { row.style.display = row.textContent.toUpperCase().includes(val) ? "" : "none"; }
}

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if(modal.style.display === 'flex') renderBasket();
}

function closeProductView() { document.getElementById('productViewModal').style.display = 'none'; }
      
