let isAdmin = false;
let basket = [];
let currentLiveItems = [];

// --- CONFIGURATION ---
const ADMIN_PHONE = "639123456789"; // Palitan mo ng number mo
const FB_USERNAME = "iyong.fb.username"; // Palitan mo ng FB username mo
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
                <td><img src="${img}" class="product-img" onerror="this.src='https://via.placeholder.com/60?text=Error'"></td>
                <td>
                    <strong>${item.name}</strong><br>
                    <span class="status-badge ${statusClass}">${item.status}</span><br>
                    <small style="color:#666">${item.qty || ''}</small>
                    ${item.expiry ? `<br><small style="color:red">EXP: ${item.expiry}</small>` : ''}
                </td>
                <td class="price-tag">₱${Number(item.price).toLocaleString()}</td>
                <td class="no-print">
                    ${isAdmin ? 
                        `<button class="delete-btn" onclick="alert('I-edit ang products.json para magbura.')">&times;</button>` : 
                        `<button onclick="addToBasket('${item.name}', ${item.price})" style="background:#1a73e8; padding:8px; font-size:11px; color:white; border-radius:5px; border:none; cursor:pointer;">+ Basket</button>`
                    }
                </td>
            </tr>
        `;
    });
    document.getElementById('totalItems').innerText = items.length;
    document.getElementById('totalValue').innerText = "₱" + totalVal.toLocaleString();
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
        if (pass === "123") {
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

