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

function setupCarousel(items) {
    const track = document.getElementById('carouselTrack');
    const displayList = [...items, ...items]; 
    track.innerHTML = displayList.map(item => `
        <div class="carousel-item">
            <img src="${item.image}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <p>${item.name}</p>
        </div>
    `).join('');
}

function displayItems(items) {
    let grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    items.forEach((item, index) => {
        let statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        grid.innerHTML += `
            <div class="product-card">
                <img src="${item.image}" onclick="openProductView(${index})" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                <div onclick="openProductView(${index})" style="cursor:pointer; flex-grow:1;">
                    <span class="status-badge ${statusClass}">${item.status}</span>
                    <h4>${item.name}</h4>
                    <div class="price-tag">₱${(item.pricePiece || 0).toLocaleString()} / pc</div>
                </div>
                <div style="display:flex; flex-direction:column;">
                    ${isAdmin ? `<button onclick="deleteItem(${index})" style="background:#dc3545; color:white; border:none; padding:5px; border-radius:5px; margin-top:5px;">Delete</button>` : 
                    `
                        <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece')">+ Piece</button>
                        <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box')" style="background:#28a745;">+ Box</button>
                    `}
                </div>
            </div>`;
    });
}

function openProductView(index) {
    const item = currentLiveItems[index];
    document.getElementById('viewImage').src = item.image;
    document.getElementById('viewName').innerText = item.name;
    document.getElementById('viewQty').innerText = "Unit: " + (item.qty || 'N/A');
    document.getElementById('viewWeight').innerText = "Weight: " + (item.weight || 'N/A');
    document.getElementById('viewExpiry').innerText = "Expiry: " + (item.expiry || 'N/A');
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${item.status === "In Stock" ? "in-stock" : "out-stock"}">${item.status}</span>`;
    
    document.getElementById('viewPriceContainer').innerHTML = `
        <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece'); closeProductView();" style="width:45%; padding:10px;">+ Piece (₱${item.pricePiece})</button>
        <button class="opt-btn" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box'); closeProductView();" style="width:45%; padding:10px; background:#28a745;">+ Box (₱${item.priceBox})</button>
    `;
    document.getElementById('productViewModal').style.display = 'flex';
}

function addToBasket(name, price, type) {
    const key = `${name} (${type})`;
    if (basket[key]) { basket[key].count += 1; } 
    else { basket[key] = { price: price, count: 1, type: type, originalName: name }; }
    updateBasketCount();
    document.getElementById('basketFloat').style.display = 'flex';
}

function updateBasketCount() {
    let total = 0;
    for (let k in basket) { total += basket[k].count; }
    document.getElementById('basketCount').innerText = total;
    if (total === 0) document.getElementById('basketFloat').style.display = 'none';
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
            <div style="flex:1;"><span style="font-size:13px; font-weight:bold;">${key}</span><br><small>₱${item.price.toLocaleString()}</small></div>
            <div style="display:flex; align-items:center;">
                <button onclick="removeFromBasket('${key}')" style="width:25px; height:25px; border-radius:50%; border:none;">-</button>
                <span style="width:25px; text-align:center;">${item.count}</span>
                <button onclick="addToBasket('${item.originalName}', ${item.price}, '${item.type}'); renderBasket();" style="width:25px; height:25px; border-radius:50%; border:none;">+</button>
                <span style="margin-left:10px; font-weight:bold; width:65px; text-align:right;">₱${subtotal.toLocaleString()}</span>
            </div>
        </div>`;
    }
    list.innerHTML = html || "<p style='text-align:center; color:#999;'>Empty basket.</p>";
    document.getElementById('basketTotal').innerText = "₱" + total.toLocaleString();
}

function removeFromBasket(key) {
    if (basket[key]) {
        basket[key].count -= 1;
        if (basket[key].count <= 0) delete basket[key];
    }
    updateBasketCount();
    renderBasket();
}

function sendOrder(platform) {
    const name = document.getElementById('customerName').value;
    const address = document.getElementById('customerAddress').value;
    if(!name || !address || Object.keys(basket).length === 0) return alert("Paki-puno ang details!");

    let msg = `*BAGONG ORDER*\n👤 Name: ${name.toUpperCase()}\n📍 Addr: ${address}\n----------\n`;
    let total = 0;
    for (let k in basket) {
        let item = basket[k];
        msg += `- ${k} x ${item.count} = ₱${(item.price * item.count).toLocaleString()}\n`;
        total += (item.price * item.count);
    }
    msg += `----------\n*TOTAL: ₱${total.toLocaleString()}*`;

    if(platform === 'whatsapp') window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`);
    else { navigator.clipboard.writeText(msg); alert("Copied! Paste to Messenger."); window.open(`https://m.me/${FB_USERNAME}`); }
}

function toggleAdmin() {
    if (!isAdmin) { 
        if (prompt("Pass:") === "123") { 
            localStorage.setItem('adminLoggedIn', 'true'); 
            location.reload(); 
        } 
    }
    else { 
        localStorage.removeItem('adminLoggedIn'); 
        location.reload(); 
    }
}

function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    const statusText = document.getElementById('adminStatus');
    statusText.innerText = "Admin Mode Activated";
    statusText.style.color = "#2ecc71";
    document.getElementById('loginBtn').innerText = "Logout";
}

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if(modal.style.display === 'flex') renderBasket();
}

function closeProductView() { document.getElementById('productViewModal').style.display = 'none'; }

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let cards = document.getElementsByClassName('product-card');
    for (let card of cards) {
        card.style.display = card.innerText.toUpperCase().includes(val) ? "" : "none";
    }
}

function addNewProduct() {
    const newItem = {
        name: document.getElementById('itemName').value,
        qty: document.getElementById('itemQty').value,
        weight: document.getElementById('itemWeight').value,
        pricePiece: Number(document.getElementById('itemPricePiece').value),
        priceBox: Number(document.getElementById('itemPriceBox').value),
        status: document.getElementById('itemStatus').value,
        expiry: document.getElementById('itemExpiry').value,
        image: document.getElementById('itemImageLink').value
    };
    currentLiveItems.push(newItem);
    displayItems(currentLiveItems);
    copyNewJSON();
}

function deleteItem(index) { if(confirm("Burahin?")) { currentLiveItems.splice(index, 1); displayItems(currentLiveItems); copyNewJSON(); } }

function copyNewJSON() { 
    navigator.clipboard.writeText(JSON.stringify(currentLiveItems, null, 2))
    .then(() => alert("JSON Copied! I-update ang iyong products.json file."))
    .catch(err => console.error("Clipboard error:", err)); 
}
