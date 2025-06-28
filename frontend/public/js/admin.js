// admin.js
const ROOT_URL = window.ROOT_URL || 'localhost';

// --- Produktverwaltung ---
async function fetchProducts() {
    const res = await fetch(`http://${ROOT_URL}:3000/api/products`);
    const products = await res.json();
    // Produkte rendern, Buttons für Bearbeiten/Löschen/Bestellungen
}

async function addProduct(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        price: form.price.value,
        seller_id: form.seller_id.value
    };
    // Validierung seller_id (z.B. existiert Seller?)
    await fetch(`http://${ROOT_URL}:3000/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    fetchProducts();
}

document.getElementById('add-product-form').addEventListener('submit', addProduct);

// --- Userverwaltung ---
async function fetchUsers() {
    const res = await fetch(`http://${ROOT_URL}:3000/api/users`);
    const result = await res.json();
    const users = Array.isArray(result.data) ? result.data.filter(user => user.role !== 'Admin') : [];

    const userList = document.getElementById('user-list');
    userList.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Adresse</th>
                    <th>Rolle</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.first_name} ${user.last_name}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>
                            ${user.street} ${user.house_number},<br>
                            ${user.postal_code} ${user.city},<br>
                            ${user.country}
                        </td>
                        <td>${user.role}</td>
                        <td class="actions">
                            <button onclick="showUserDetails(${user.id})">Details</button>
                            <button onclick="editUser(${user.id})">Bearbeiten</button>
                            <button onclick="deleteUser(${user.id})">Löschen</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
// --- Initialisierung ---
fetchProducts();
fetchUsers();