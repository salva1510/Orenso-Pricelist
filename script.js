let isAdmin = false;
let basket = [];
let currentLiveItems = [];

// --- CONFIGURATION ---
const ADMIN_PHONE = "639154290207"; // Palitan mo ng number mo
const FB_USERNAME = "kram.samot.2024"; // Palitan mo ng FB username mo
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
        document.getElementById('productBody').innerHTML = "<tr><td colspan='4' style='text-align:center;'>Wala pang data o may error sa JSON.</td></tr>";
    }
}

// Palitan ang displayItems function para maging clickable ang image
function displayItems(items) {
    let tableBody = document.getElementById('productBody');
    let totalVal = 0;
    tableBody.innerHTML = '';

    items.forEach((item, index) => {
        totalVal += Number(item.price);
        let statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
        let img = item.image || 'https://via.placeholder.com/60';

        tableBody.innerHTML += `
            <tr>
                <td><img src="${img}" class="product-img" onclick="openProductView(${index})" onerror="this.src='https://via.placeholder.com/60'"></td>
                <td onclick="openProductView(${index})" style="cursor:pointer;">
                    <strong>${item.name}</strong><br>
                    <span class="status-badge ${statusClass}">${item.status}</span><br>
                    <small>${item.qty || ''}</small>
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

// Bagong function para sa pag-open ng Product Details
function openProductView(index) {
    const item = currentLiveItems[index];
    document.getElementById('viewImage').src = item.image || 'https://via.placeholder.com/60';
    document.getElementById('viewName').innerText = item.name;
    document.getElementById('viewQty').innerText = item.qty || 'No unit specified';
    document.getElementById('viewPrice').innerText = "₱" + item.price.toLocaleString();
    document.getElementById('viewExpiry').innerText = item.expiry ? "Expiry: " + item.expiry : "";
    
    // Status Badge sa Modal
    const statusClass = item.status === "In Stock" ? "in-stock" : "out-stock";
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${statusClass}">${item.status}</span>`;
    
    // Add to Basket button sa loob ng Modal
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

function addToBasket(name, price) {
    basket.push({ name, price });
    updateBasketUI();
    document.getElementById('basketFloat').style.display = 'flex';
}

function updateBasketUI() {
    document.getElementById('basketCount').innerText = basket.length;
    let list = document.getElementById('basketList');
    let total = 0;
    list.innerHTML = basket.map((item, i) => {
        total += item.price;
        return `<div class="basket-item">
            <span>${item.name}</span>
            <span>₱${item.price.toLocaleString()} <button onclick="removeFromBasket(${i})" class="delete-btn">&times;</button></span>
        </div>`;
    }).join('');
    document.getElementById('basketTotal').innerText = "₱" + total.toLocaleString();
}

function removeFromBasket(i) {
    basket.splice(i, 1);
    updateBasketUI();
    if(basket.length === 0) {
        document.getElementById('basketFloat').style.display = 'none';
        toggleBasketModal();
    }
}

function toggleBasketModal() {
    const modal = document.getElementById('basketModal');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

function sendOrder(platform) {
    const name = document.getElementById('customerName').value;
    const contact = document.getElementById('customerContact').value;
    const gcash = document.getElementById('customerGcash').value;
    if(!name || !contact) return alert("Paki-puno ang Pangalan at Contact No.");
    
    let msg = `*BAGONG ORDER MULA SA WEBSITE*\n`;
    msg += `👤 Customer: ${name.toUpperCase()}\n`;
    msg += `📞 Contact: ${contact}\n`;
    if(gcash) msg += `💰 GCash: ${gcash}\n`;
    msg += `----------------------------\n`;
    let total = 0;
    basket.forEach(item => {
        msg += `- ${item.name} (₱${item.price.toLocaleString()})\n`;
        total += item.price;
    });
    msg += `\n*TOTAL: ₱${total.toLocaleString()}*`;

    if(platform === 'whatsapp') {
        window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
        navigator.clipboard.writeText(msg).then(() => {
            alert("Order details copied! I-paste sa Messenger chat box.");
            window.open(`https://m.me/${FB_USERNAME}`, '_blank');
        });
    }
}

function toggleAdmin() {
    if (!isAdmin) {
        let pass = prompt("Enter Admin Password:");
        if (pass === "salva1234") {
            isAdmin = true;
            localStorage.setItem('adminLoggedIn', 'true');
            applyAdminUI();
            location.reload();
        }
    } else {
        localStorage.removeItem('adminLoggedIn');
        location.reload();
    }
}

function applyAdminUI() {
    document.getElementById('adminSection').style.display = "block";
    document.getElementById('adminStatus').innerText = "Mode: Admin (Logged In)";
    document.getElementById('loginBtn').innerText = "Logout";
    document.getElementById('loginBtn').style.background = "#dc3545";
    document.getElementById('clearBtn').style.display = "block";
}

function searchFunction() {
    let input = document.getElementById('searchInput').value.toUpperCase();
    let rows = document.getElementById('productBody').getElementsByTagName('tr');
    for (let row of rows) {
        row.style.display = row.textContent.toUpperCase().includes(input) ? "" : "none";
    }
}

function exportToExcel() {
    let csv = "Item,Price,Status\n";
    currentLiveItems.forEach(i => csv += `"${i.name}",${i.price},"${i.status}"\n`);
    let link = document.createElement("a");
    link.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    link.download = "inventory.csv";
    link.click();
}
// Dagdag na function para sa pag-add ng product
function addNewProduct() {
    const name = document.getElementById('itemName').value;
    const qty = document.getElementById('itemQty').value;
    const price = document.getElementById('itemPrice').value;
    const status = document.getElementById('itemStatus').value;
    const expiry = document.getElementById('itemExpiry').value;
    const image = document.getElementById('itemImageLink').value;

    if (!name || !price) return alert("Paki-puno ang Name at Price!");

    // Gagawa ng bagong object
    const newProduct = {
        name: name,
        qty: qty,
        price: Number(price),
        status: status,
        expiry: expiry,
        image: image
    };

    // Idadagdag sa pansamantalang listahan
    currentLiveItems.push(newProduct);
    displayItems(currentLiveItems);

    // I-generate ang JSON code para i-copy paste mo na lang sa GitHub
    const finalJSON = JSON.stringify(currentLiveItems, null, 2);
    
    // I-copy sa clipboard para i-paste mo na lang sa products.json sa GitHub
    navigator.clipboard.writeText(finalJSON).then(() => {
        alert("Product added to list! Nakopya na rin ang bagong JSON code. I-paste mo na lang ito sa products.json file mo sa GitHub para maging permanent.");
    });

    // I-clear ang inputs
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
}


