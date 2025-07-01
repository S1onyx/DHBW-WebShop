import { showPopupMessage } from '/js/utils.js';

// --- Produktverwaltung ---
async function fetchProducts() {
    const res = await fetch(`http://${window.ROOT_URL }:3000/api/products`, {credentials: 'include'});
    const products = await res.json();
    // Produkte rendern, Buttons für Bearbeiten/Löschen/Bestellungen
}

async function addProduct(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/products`, {
            method: 'POST',
            credentials: 'include',
            body: formData // Pass FormData directly, don't set Content-Type manually
        });

        const json = await res.json();

        if (!res.ok) {
            showPopupMessage(json.message || 'Error while creating product', 3000);
            return;
        }

        showPopupMessage('Product successfully created', 1500);
        fetchProducts();
        form.reset();
    } catch (err) {
        showPopupMessage('Network error while creating product', 3000);
    }
}

document.getElementById('add-product-form').addEventListener('submit', addProduct);

// --- Hilfsfunktion: Seller laden für Produktformular ---
async function loadSellers() {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/users?role=2`, {credentials: 'include'});
    const result = await res.json();
    const sellers = Array.isArray(result.data) ? result.data : [];
    const select = document.getElementById('seller_id');
    if (select) {
        select.innerHTML = sellers.map(s => `<option value="${s.id}">${s.first_name} ${s.last_name} (${s.username})</option>`).join('');
    }
}

// --- Produktformular initialisieren (Dropdown für Seller) ---
document.addEventListener('DOMContentLoaded', () => {
    loadSellers();
});

// --- User-Suche & Filter ---
function filterUsers() {
    const search = document.getElementById('user-search').value.toLowerCase();
    const role = document.getElementById('role-filter').value;
    document.querySelectorAll('#user-list tbody tr').forEach(row => {
        const cells = Array.from(row.children).map(td => td.textContent.toLowerCase());
        const matchesSearch = cells.some(text => text.includes(search));
        const matchesRole = !role || cells[4] === role.toLowerCase();
        row.style.display = (matchesSearch && matchesRole) ? '' : 'none';
    });
}

// --- Userverwaltung (angepasst) ---
async function fetchUsers() {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/users`, {credentials: 'include'});
    const result = await res.json();
    const users = Array.isArray(result.data) ? result.data.filter(user => user.role !== 'Admin') : [];

    const userList = document.getElementById('user-list');
    userList.innerHTML = `
        <input id="user-search" placeholder="Suche nach Name, Username, Email, Rolle..." oninput="filterUsers()">
        <select id="role-filter" onchange="filterUsers()">
            <option value="">Alle Rollen</option>
            <option value="Admin">Admin</option>
            <option value="Seller">Seller</option>
            <option value="Customer">Customer</option>
        </select>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Address</th>
                    <th>Role</th>
                    <th></th>
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
                            <button class="details-btn"  onclick="showUserDetails(${user.id}, false)">Details</button>
                            <button onclick="showUserDetails(${user.id}, true)">Edit</button>
                            <button class="delete-btn" data-id="${user.id}"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById('user-search').addEventListener('input', filterUsers);
    document.getElementById('role-filter').addEventListener('change', filterUsers);

    userList.querySelectorAll('.delete-btn').forEach(btn => {
        const id = btn.getAttribute('data-id');
        btn.addEventListener('click', () => deleteUser(id));
    });

    async function deleteUser(id) {
        try {
            const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const json = await res.json();

            if (!res.ok) {
                showPopupMessage(json.message || 'Error while deleting the user', 3000);
                return;
            }

            showPopupMessage('User successfully deleted', 1500);
            fetchUsers(); // or whatever function updates your user list
        } catch (err) {
            showPopupMessage('Network error while deleting user', 3000);
        }
    }
}

function getStatusId(user) {
    if (typeof user.status_id === 'number') return user.status_id;
    if (user.status === 'validated') return 1;
    if (user.status === 'notValidated') return 2;
    return '';
}
function getStatusLabel(user) {
    if (user.status === 'validated' || user.status_id === 1) return 'Validated';
    if (user.status === 'notValidated' || user.status_id === 2) return 'Unvalidated';
    return '';
}

// --- showUserDetails anpassen ---
async function showUserDetails(id, editable = false) {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/${id}`, {credentials: 'include'});
    const user = await res.json();

    const statusOptions = [
        { id: 1, label: 'Validated' },
        { id: 2, label: 'Unvalidated' }
    ];

    const modal = document.getElementById('modal');
    modal.classList.add('active');

    modal.innerHTML = `
      <div>
        <h2>User ${editable ? 'Edit' : 'Details'}</h2>
        <form id="user-form">
          <label>First name:<br>
            ${editable
        ? `<input name="first_name" value="${user.data.first_name}" required>`
        : `<span>${user.data.first_name}</span>`}
          </label><br>
          <label>Last name:<br>
            ${editable
        ? `<input name="last_name" value="${user.data.last_name}" required>`
        : `<span>${user.data.last_name}</span>`}
          </label><br>
          <label>Username:<br>
            <span>${user.data.username}</span>
          </label><br>
          <label>Email:<br>
            <span>${user.data.email}</span>
          </label><br>
          <label>Status:<br>
            ${editable
        ? `<select name="status_id" required>
                    ${statusOptions.map(opt => `<option value="${opt.id}" ${getStatusId(user.data) === opt.id ? 'selected' : ''}>${opt.label}</option>`).join('')}
                  </select>`
        : `<span>${getStatusLabel(user.data)}</span>`}
          </label><br>
          <label>Address:<br>
            <span>
              ${user.data.street} ${user.data.house_number},<br>
              ${user.data.postal_code} ${user.data.city},<br>
              ${user.data.country}
            </span>
          </label><br>
          <button type="button" onclick="closeModal()">Close</button>
          ${editable ? `<button type="submit">Save</button>` : ''}
        </form>
      </div>
    `;

    if (editable) {
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            // status_id als Zahl senden
            data.status_id = Number(data.status_id);
            try {
                const res = await fetch(`http://${window.ROOT_URL}:3000/api/admin/users/${id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await res.json();
                if (!res.ok) {
                    showPopupMessage(json.message || 'Error while saving', 3000);
                } else {
                    showPopupMessage('Changes saved!', 1500);
                    fetchUsers();
                    setTimeout(closeModal, 1200);
                }
            } catch {
                showPopupMessage('Network error while saving', 3000);
            }
        };
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.innerHTML = '';
}
// --- Initialisierung ---
fetchProducts();
fetchUsers();

window.showUserDetails = showUserDetails;
window.closeModal = closeModal;
window.filterUsers = filterUsers;
window.addProduct = addProduct;
window.loadSellers = loadSellers;
