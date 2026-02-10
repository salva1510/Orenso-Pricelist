let isAdmin = false;
let basket = {}; 
let currentLiveItems = [];
let editIndex = -1; // -1 means adding new, otherwise it's the index being edited

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
        setupSlider(currentLiveItems);
    } catch (e) { console.error("Error loading JSON:", e); }
}

function displayItems(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map((item, index) => {
        const statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        return `
            <div class="product-card">
                <img src="${item.image}" onclick="openProductView(${index})" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                <div onclick="openProductView(${index})" style="cursor:pointer; flex-grow:1;">
                    <span class="status-badge ${statusClass}">${item.status}</span>
                    <h4>${item.name}</h4>
                    <div class="item-details-text">${item.qty || ''} ${item.weight ? ' • ' + item.weight : ''}</div>
                    <div class="price-tag">₱${(item.pricePiece || 0).toLocaleString()} / pc</div>
                </div>
                <div style="display:flex; flex-direction:column; gap: 5px;">
                    ${isAdmin ? `
                        <button onclick="startEdit(${index})" style="background:#f39c12; color:#fff; border:none; padding:8px; border-radius:8px; cursor:pointer; font-weight:bold;">Edit</button>
                        <button onclick="deleteItem(${index})" style="background:#dc3545; color:#fff; border:none; padding:8px; border-radius:8px; cursor:pointer; font-weight:bold;">Delete</button>
                    ` : 
                    `
                        <button class="opt-btn btn-pc" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece')">+ Piece</button>
                        <button class="opt-btn btn-box" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box')">+ Box</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function openProductView(index) {
    const item = currentLiveItems[index];
    document.getElementById('viewImage').src = item.image;
    document.getElementById('viewName').innerText = item.name;
    document.getElementById('viewDesc').innerText = item.description || "No special notes for this item.";
    document.getElementById('viewQty').innerText = "📦 Unit: " + (item.qty || 'N/A');
    document.getElementById('viewWeight').innerText = "⚖️ Weight: " + (item.weight || 'N/A');
    document.getElementById('viewExpiry').innerText = "📅 Expiry: " + (item.expiry || 'Not set');
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${item.status === "In Stock" ? "in-stock" : "out-stock"}">${item.status}</span>`;
    document.getElementById('viewPriceContainer').innerHTML = `
        <button class="opt-btn btn-pc" onclick="addToBasket('${item.name}', ${item.pricePiece}, 'Piece'); closeProductView();" style="width:48%;">Add Piece (₱${item.pricePiece})</button>
        <button class="opt-btn btn-box" onclick="addToBasket('${item.name}', ${item.priceBox}, 'Box'); closeProductView();" style="width:48%;">Add Box (₱${item.priceBox})</button>
    `;
    document.getElementById('productViewModal').style.display = 'flex';
}

// EDIT FEATURE LOGIC
function startEdit(index) {
    editIndex = index;
    const item = currentLiveItems[index];
    
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemQty').value = item.qty;
    document.getElementById('itemWeight').value = item.weight;
    document.getElementById('itemPricePiece').value = item.pricePiece;
    document.getElementById('itemPriceBox').value = item.priceBox;
    document.getElementById('itemStatus').value = item.status;
    document.getElementById('itemExpiry').value = item.expiry;
    document.getElementById('itemDesc').value = item.description || "";
    document.getElementById('itemImageLink').value = item.image;

    document.getElementById('addBtn').innerText = "Update Product & Copy JSON";
    document.getElementById('cancelEditBtn').style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearAdminForm() {
    editIndex = -1;
    document.getElementById('itemName').value = "";
    document.getElementById('itemQty').value = "";
    document.getElementById('itemWeight').value = "";
    document.getElementById('itemPricePiece').value = "";
    document.getElementById('itemPriceBox').value = "";
    document.getElementById('itemStatus').value = "In Stock";
    document.getElementById('itemExpiry').value = "";
    document.getElementById('itemDesc').value = "";
    document.getElementById('itemImageLink').value = "";
    
    document.getElementById('addBtn').innerText = "+ Add Product";
    document.getElementById('cancelEditBtn').style.display = "none";
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
        description: document.getElementById('itemDesc').value,
        image: document.getElementById('itemImageLink').value
    };

    if(!newItem.name) return alert("Paki-lagay ang pangalan!");

    if(editIndex > -1) {
        currentLiveItems[editIndex] = newItem;
        alert("Item updated!");
    } else {
        currentLiveItems.push(newItem);
        alert("Item added!");
    }

    displayItems(currentLiveItems);
    clearAdminForm();
    copyNewJSON();
}

// REST OF THE FUNCTIONS (Slider, Basket, Search, etc.)
function setupSlider(items) {
    const track = document.getElementById('imageSlider');
    track.innerHTML = items.map((item, index) => `
        <div class="slider-item" onclick="openProductView(${index})" style="cursor:pointer;">
            <img src="${item.image}">
            <p>${item.name}</p>
        </div>
    `).join('');
}

function deleteItem(index) {
    if(confirm("Burahin ang item na ito?")) {
        currentLiveItems.splice(index, 1);
        displayItems(currentLiveItems);
        copyNewJSON();
    }
}

function copyNewJSON() { 
    navigator.clipboard.writeText(JSON.stringify(currentLiveItems, null, 2))
    .then(() => console.log("JSON Copied!"));
}

function toggleAdmin() {
    if (isAdmin) { localStorage.removeItem('adminLoggedIn'); location.reload(); }
    else if (prompt("Password:") === "123") { localStorage.setItem('adminLoggedIn', 'true'); location.reload(); }
}

function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    document.getElementById('adminStatus').innerText = "Admin Mode";
    document.getElementById('loginBtn').innerText = "Logout";
}

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let cards = document.getElementsByClassName('product-card');
    for (let card of cards) card.style.display = card.innerText.toUpperCase().includes(val) ? "flex" : "none";
}

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function closeProductView() { document.getElementById('productViewModal').style.display = 'none'; }
      
