let isAdmin = false;
let basket = {}; // Object to track quantities
let currentLiveItems = [];

// --- CONFIGURATION ---
const ADMIN_PHONE = "639153290207"; // Palitan ng WhatsApp number mo
const FB_USERNAME = "kram.samot.2024"; // Palitan ng Messenger username mo
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
    } catch (e) { console.error("Error loading JSON:", e); }
}

function displayItems(items) {
    let tableBody = document.getElementById('productBody');
    let totalVal = 0;
    tableBody.innerHTML = '';
    items.forEach((item, index) => {
        totalVal += Number(item.price);
        let statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        tableBody.innerHTML += `
            <tr>
                <td><img src="${item.image || 'https://via.placeholder.com/60'}" class="product-img" onclick="openProductView(${index})" onerror="this.src='https://via.placeholder.com/60'"></td>
                <td onclick="openProductView(${index})" style="cursor:pointer;">
                    <strong>${item.name}</strong><br>
                    <span class="status-badge ${statusClass}">${item.status}</span><br>
                    <small>${item.qty || ''} ${item.weight ? '| ' + item.weight : ''}</small>
                </td>
                <td style="font-weight:bold; color:#28a745">₱${item.price.toLocaleString()}</td>
                <td>
                    ${isAdmin ? `<button onclick="deleteItem(${index})" style="color:red; background:none; font-size:20px; border:none;">&times;</button>` : 
                    `<button onclick="addToBasket('${item.name}', ${item.price})" style="background:#1a73e8; padding:8px; font-size:12px; color:white; border:none; border-radius:5px;">+ Basket</button>`}
                </td>
            </tr>`;
    });
    document.getElementById('totalItems').innerText = items.length;
    document.getElementById('totalValue').innerText = "₱" + totalVal.toLocaleString();
}

// Product View Modal
function openProductView(index) {
    const item = currentLiveItems[index];
    document.getElementById('viewImage').src = item.image || 'https://via.placeholder.com/60';
    document.getElementById('viewName').innerText = item.name;
    document.getElementById('viewQty').innerText = "Unit: " + (item.qty || 'N/A');
    document.getElementById('viewWeight').innerText = "Weight: " + (item.weight || 'N/A');
    document.getElementById('viewPrice').innerText = "₱" + item.price.toLocaleString();
    document.getElementById('viewExpiry').innerText = item.expiry ? "Expires: " + item.expiry : "";
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${item.status === "In Stock" ? "in-stock" : "out-stock"}">${item.status}</span>`;
    
    document.getElementById('addFromView').onclick = () => { 
        addToBasket(item.name, item.price); 
        closeProductView(); 
    };
    document.getElementById('productViewModal').style.display = 'flex';
}

function closeProductView() { document.getElementById('productViewModal').style.display = 'none'; }

// Admin Add & Delete Logic (GitHub Copy-Paste Method)
function addNewProduct() {
    if(!isAdmin) return;
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    if (!name || !price) return alert("Paki-puno ang Name at Price!");

    const newProduct = {
        name: name,
        qty: document.getElementById('itemQty').value,
        weight: document.getElementById('itemWeight').value,
        price: Number(price),
        status: document.getElementById('itemStatus').value,
        expiry: document.getElementById('itemExpiry').value,
        image: document.getElementById('itemImageLink').value
    };
    currentLiveItems.push(newProduct);
    displayItems(currentLiveItems);
    copyNewJSON();
}

function deleteItem(index) {
    if(confirm("Burahin ito sa listahan?")) {
        currentLiveItems.splice(index, 1);
        displayItems(currentLiveItems);
        copyNewJSON();
    }
}

function copyNewJSON() {
    const jsonString = JSON.stringify(currentLiveItems, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
        alert("Na-update na! Nakopya na sa Clipboard ang bagong JSON code. I-paste mo na ito sa products.json mo sa GitHub.");
    });
}

// Basket Logic (With Qty Controls)
function addToBasket(name, price) {
    if (basket[name]) {
        basket[name].count += 1;
    } else {
        basket[name] = { price: price, count: 1 };
    }
    updateBasketCount();
    document.getElementById('basketFloat').style.display = 'flex';
}

function removeFromBasket(name) {
    if (basket[name]) {
        basket[name].count -= 1;
        if (basket[name].count <= 0) delete basket[name];
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

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if(modal.style.display === 'flex') renderBasket();
}

function renderBasket() {
    const list = document.getElementById('basketList');
    let total = 0;
    let html = "";
    for (let name in basket) {
        let item = basket[name];
        let subtotal = item.price * item.count;
        total += subtotal;
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #eee;">
                <div style="flex:1;"><span style="font-size:14px; font-weight:bold;">${name}</span><br><small>₱${item.price.toLocaleString()}</small></div>
                <div style="display:flex; align-items:center;">
                    <button class="qty-btn" onclick="removeFromBasket('${name}')">-</button>
                    <span style="width:20px; text-align:center;">${item.count}</span>
                    <button class="qty-btn" onclick="addToBasket('${name}', ${item.price}); renderBasket();">+</button>
                    <span style="margin-left:10px; font-weight:bold; width:70px; text-align:right;">₱${subtotal.toLocaleString()}</span>
                </div>
            </div>`;
    }
    list.innerHTML = html || "<p style='text-align:center; color:#999;'>Walang laman ang basket.</p>";
    document.getElementById('basketTotal').innerText = "₱" + total.toLocaleString();
}

// Send Order Logic
function sendOrder(platform) {
    const name = document.getElementById('customerName').value;
    const contact = document.getElementById('customerContact').value;
    const payment = document.getElementById('paymentMethod').value;

    if(!name || !contact) return alert("Paki-puno ang Name at Contact No.");
    if(Object.keys(basket).length === 0) return alert("Walang laman ang basket.");
    
    let msg = `*BAGONG ORDER*\n`;
    msg += `👤 Customer: ${name.toUpperCase()}\n`;
    msg += `📞 Contact: ${contact}\n`;
    msg += `💳 Payment: ${payment}\n`;
    msg += `----------\n`;
    
    let total = 0;
    for (let productName in basket) {
        let item = basket[productName];
        let subtotal = item.price * item.count;
        msg += `- ${productName} (${item.count}x) = ₱${subtotal.toLocaleString()}\n`;
        total += subtotal;
    }
    msg += `----------\n*TOTAL: ₱${total.toLocaleString()}*`;
    
    if(platform === 'whatsapp') {
        window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`);
    } else {
        navigator.clipboard.writeText(msg).then(() => {
            alert("Order details copied! I-paste sa Messenger.");
            window.open(`https://m.me/${FB_USERNAME}`);
        });
    }
}

// Admin Utils
function toggleAdmin() {
    if (!isAdmin) {
        if (prompt("Admin Password:") === "123") {
            localStorage.setItem('adminLoggedIn', 'true');
            location.reload();
        }
    } else {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    document.getElementById('adminStatus').innerText = "Mode: Admin";
    document.getElementById('loginBtn').innerText = "Logout";
    document.getElementById('loginBtn').style.background = "#dc3545";
}

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let rows = document.getElementById('productBody').getElementsByTagName('tr');
    for (let row of rows) { row.style.display = row.textContent.toUpperCase().includes(val) ? "" : "none"; }
}

function exportToExcel() {
    let csv = "Item,Weight,Price,Status\n";
    currentLiveItems.forEach(i => csv += `"${i.name}","${i.weight || ''}",${i.price},"${i.status}"\n`);
    let link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = "inventory_report.csv";
    link.click();
}

