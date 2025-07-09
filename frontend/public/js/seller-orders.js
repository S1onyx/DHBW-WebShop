const statusLabels = {
    1: 'Open',
    2: 'Processing',
    3: 'Completed'
};

async function fetchOrders() {
    const status = document.getElementById('order-status-filter').value;
    const url = `http://localhost:3000/api/orders${status ? '?status=' + status : ''}`;
    const res = await fetch(url, { credentials: 'include' });
    const { data } = await res.json();
    renderOrders(data || []);
}

function renderOrders(products) {
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = products.map(product => {
        // Produktüberschrift mit Häufigkeit
        const headerRow = `
            <tr class="product-header">
                <td colspan="6" style="font-weight:bold;">
                    ${product.name} &ndash; Verkäufe: ${product.sales.length}
                </td>
            </tr>
        `;
        // Einzelne Bestellungen
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
                    <td>${product.product_id}</td>
                    <td>${sale.customer_name || '-'}</td>
                    <td>${sale.quantity}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <select data-id="${product.product_id}" class="order-status-select">
                            ${statusOptions.join('')}
                        </select>
                    </td>
                    <td>
                        <button class="save-status-btn" data-id="${product.product_id}">Save</button>
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
            fetchOrders();
        };
    });
}

document.getElementById('order-status-filter').onchange = fetchOrders;
document.addEventListener('DOMContentLoaded', fetchOrders);