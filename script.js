let isAdmin = false;
let basket = [];
let currentLiveItems = [];

// --- CONFIGURATION ---
const ADMIN_PHONE = "639123456789"; // Iyong WhatsApp
const FB_USERNAME = "iyong.fb.username"; // Iyong FB Username
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
    } catch (e) {
        console.error("Error loading JSON:", e);
    }
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
                    ${isAdmin ? `<button onclick="deleteItem(${index})" style="background:none; color:red; font-size:18px; border:none;">&times;</button>` : 
                    `<button onclick="addToBasket('${item.name}', ${item.price})" style="background:#1a73e8; padding:5px 10px; font-size:12px; color:white; border:none; border-radius:5px;">+ Basket</button>`}
                </td>
            </tr>
        `;
    });
    document.getElementById('totalItems').innerText = items.length;
    document.getElementById('totalValue').innerText = "₱" + totalVal.toLocaleString();
}

// Product View Modal Functions
function openProductView(index) {
    const item = currentLiveItems[index];
    document.getElementById('viewImage').src = item.image || 'https://via.placeholder.com/60';
    document.getElementById('viewName').innerText = item.name;
    document.getElementById('viewQty').innerText = "Unit: " + (item.qty || 'N/A');
    document.getElementById('viewWeight').innerText = "Weight: " + (item.weight || 'N/A');
    document.getElementById('viewPrice').innerText = "₱" + item.price.toLocaleString();
    document.getElementById('viewExpiry').innerText = item.expiry ? "Expires: " + item.expiry : "";
    
    const statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${statusClass}">${item.status}</span>`;
    
    const addBtn = document.getElementById('addFromView');
    addBtn.onclick = function() {
        addToBasket(item.name, item.price);
        closeProductView();
    };
    document.getElementById('productViewModal').style.display = 'flex';
}

function closeProductView() {
    document.getElementById('productViewModal').style.display = 'none';
}

// Admin Add & Delete (GitHub Copy-Paste Method)
function addNewProduct() {
    if(!isAdmin) return;
    const name = document.getElementById('itemName').value;
    const price = document.getElementById('itemPrice').value;
    const image = document.getElementById('itemImageLink').value;

    if (!name || !price) return alert("Paki-puno ang Name at Price!");

    const newProduct = {
        name: name,
        qty: document.getElementById('itemQty').value,
        weight: document.getElementById('itemWeight').value,
        price: Number(price),
        status: document.getElementById('itemStatus').value,
        expiry: document.getElementById('itemExpiry').value,
        image: image
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

// Basket & Order Logic
function addToBasket(name, price) {
    basket.push({name, price});
    document.getElementById('basketCount').innerText = basket.length;
    document.getElementById('basketFloat').style.display = 'flex';
}

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    if(modal.style.display === 'flex') renderBasket();
}

function renderBasket() {
    const list = document.getElementById('basketList');
    let total = 0;
    list.innerHTML = basket.map((item, i) => {
        total += item.price;
        return `<div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid #eee;">
            <span>${item.name}</span>
            <span>₱${item.price.toLocaleString()}</span>
        </div>`;
    }).join('');
    document.getElementById('basketTotal').innerText = "₱" + total.toLocaleString();
}

function sendOrder(platform) {
    const name = document.getElementById('customerName').value;
    if(!name || basket.length === 0) return alert("Pangalan at Basket items ay kailangan.");
    
    let msg = `*BAGONG ORDER*\n👤 Name: ${name}\n----------\n`;
    basket.forEach(item => msg += `- ${item.name} (₱${item.price})\n`);
    
    if(platform === 'whatsapp') {
        window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`);
    } else {
        navigator.clipboard.writeText(msg).then(() => {
            alert("Order copied! Paste sa Messenger.");
            window.open(`https://m.me/${FB_USERNAME}`);
        });
    }
}

// Admin Controls
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
    document.getElementById('clearBtn').style.display = "block";
}

function searchFunction() {
    let val = document.getElementById('searchInput').value.toUpperCase();
    let rows = document.getElementById('productBody').getElementsByTagName('tr');
    for (let row of rows) {
        row.style.display = row.textContent.toUpperCase().includes(val) ? "" : "none";
    }
}

function exportToExcel() {
    let csv = "Item,Weight,Price,Status\n";
    currentLiveItems.forEach(i => csv += `"${i.name}","${i.weight || ''}",${i.price},"${i.status}"\n`);
    let link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = "inventory_report.csv";
    link.click();
}
  
