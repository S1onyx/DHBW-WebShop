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

    // Zeigt alle Formulardaten in der Konsole an
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    await fetch(`http://${window.ROOT_URL}:3000/api/products`, {
        method: 'POST',
        credentials: 'include',
        body: formData // kein Content-Type setzen!
    });

    fetchProducts();
    form.reset();
}

document.getElementById('add-product-form').addEventListener('submit', addProduct);

// --- Userverwaltung ---
async function fetchUsers() {
    const res = await fetch(`http://${window.ROOT_URL }:3000/api/users`, {credentials: 'include'});
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
                            <button onclick="showUserDetails(${user.id}, true)">Bearbeiten</button>
                            <button class="delete-btn" onclick="deleteUser(${user.id})"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}


async function showUserDetails(id, editable = false) {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/${id}`, {credentials: 'include'});
    const user = await res.json();

    const modal = document.getElementById('modal');
    modal.classList.add('active');

    modal.innerHTML = `
      <div>
        <h2>User ${editable ? 'bearbeiten' : 'Details'}</h2>
        <form id="user-form">
          <label>Vorname:<br>
            ${editable
        ? `<input name="first_name" value="${user.data.first_name}" required>`
        : `<span>${user.data.first_name}</span>`}
          </label><br>
          <label>Nachname:<br>
            ${editable
        ? `<input name="last_name" value="${user.data.last_name}" required>`
        : `<span>${user.data.last_name}</span>`}
          </label><br>
          <label>Email:<br>
            ${editable
        ? `<input name="email" value="${user.data.email}" required>`
        : `<span>${user.data.email}</span>`}
          </label><br>
          <label>Rolle:<br>
            ${editable
        ? `<input name="role" value="${user.data.role}" required>`
        : `<span>${user.data.role}</span>`}
          </label><br>
          <button type="button" onclick="closeModal()">Schließen</button>
          ${editable ? `<button type="submit">Speichern</button>` : ''}
        </form>
      </div>
    `;

    if (editable) {
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            await fetch(`http://${ROOT_URL}:3000/api/users/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            closeModal();
            fetchUsers();
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