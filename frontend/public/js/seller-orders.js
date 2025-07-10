import {showPopupMessage} from "/js/utils.js";

const statusLabels = {
    1: 'Pending',
    2: 'Processing',
    3: 'Shipped',
    4: 'Delivered',
    5: 'Cancelled',
};

function groupOrdersByProduct(rawOrders) {
    const grouped = {};

    for (const order of rawOrders) {
        for (const item of order.items) {
            if (!grouped[item.product_id]) {
                grouped[item.product_id] = {
                    product_id: item.product_id,
                    name: item.name,
                    sales: []
                };
            }
            grouped[item.product_id].sales.push({
                order_id: order.order_id,
                customer_name: order.customer_name,
                quantity: item.quantity,
                order_date: order.order_date,
                status: order.status
            });
        }
    }

    return Object.values(grouped);
}

async function fetchOrders() {
    const status = document.getElementById('order-status-filter')?.value;
    const productFilter = document.getElementById('product-filter');
    const productId = productFilter ? productFilter.value : '';
    let url = 'http://localhost:3000/api/orders';
    const params = [];
    if (status) params.push(`status=${status}`);
    if (productId) params.push(`product_id=${productId}`);
    if (params.length > 0) url += '?' + params.join('&');

    const res = await fetch(url, { credentials: 'include' });
    const { data } = await res.json();

    // Wenn alle Produkte angezeigt werden sollen, gruppieren wir sie
    const finalData = productId === "" ? groupOrdersByProduct(data || []) : data;

    renderOrders(finalData);
}


function renderOrders(products) {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = products.map(product => {
        const headerRow = `
            <tr class="product-header">
                <td colspan="6" style="font-weight:bold;">
                  ${product.product_id} - ${product.name} &ndash; Verkäufe: ${product.sales.length}
                </td>
            </tr>
        `;
        const salesRows = product.sales.map(sale => {
            const date = new Date(sale.order_date);
            const formattedDate = date.toLocaleString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            const statusOptions = Object.entries(statusLabels).map(([id, label]) =>
                `<option value="${id}" ${sale.status == label ? 'selected' : ''}>${label}</option>`
            );
            if (!Object.values(statusLabels).includes(sale.status)) {
                statusOptions.unshift(
                    `<option value="" selected disabled>${sale.status}</option>`
                );
            }
            return `
                <tr>
                    <td>${sale.order_id}</td>
                    <td>${sale.customer_name || '-'}</td>
                    <td>${sale.quantity}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <select data-id="${sale.order_id}" class="order-status-select">
                            ${statusOptions.join('')}
                        </select>
                    </td>
                    <td>
                        <button class="save-status-btn" data-id="${sale.order_id}">Save</button>
                    </td>
                </tr>
            `;
        }).join('');
        return headerRow + salesRows;
    }).join('');
    addStatusListeners();
}

function addStatusListeners() {
    document.querySelectorAll('.save-status-btn').forEach(btn => {
        btn.onclick = async () => {
            const id = btn.getAttribute('data-id');
            const select = document.querySelector(`.order-status-select[data-id="${id}"]`);
            const status = select.value;
            await fetch(`http://localhost:3000/api/orders/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_id: Number(status) })
            });
            showPopupMessage("Status updated!", 1200);
            fetchOrders();
        };
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const userRes = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
    const user = await userRes.json();

    if (user.data && user.data.role_id === 1) {
        // Admin: Produkt-Dropdown anzeigen und nach Produkt filtern
        await loadProductsDropdown();
        document.getElementById('order-status-filter').onchange = fetchOrders;
        document.getElementById('product-filter').onchange = fetchOrders;
        fetchOrders();
    } else {
        // Seller: wie bisher, nur nach Status filtern
        document.getElementById('order-status-filter').onchange = fetchOrders;
        fetchOrders();
    }
});

// Produkt-Dropdown für Admins
async function loadProductsDropdown() {
    const res = await fetch('http://localhost:3000/api/products', { credentials: 'include' });
    const { data: products } = await res.json();
    let dropdown = document.getElementById('product-filter');
    if (!dropdown) {
        dropdown = document.createElement('select');
        dropdown.id = 'product-filter';
        dropdown.innerHTML = `<option value="">All products</option>` +
            products.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        document.getElementById('order-status-filter').after(dropdown);
    }
}

document.getElementById('order-status-filter').onchange = fetchOrders;
document.addEventListener('DOMContentLoaded', fetchOrders);