import { showPopupMessage } from '/js/utils.js';
import { getCurrentUser } from './utils.js';

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

    const user = await getCurrentUser();
    if (!user) {
        showPopupMessage('Nicht eingeloggt', 2000);
        return;
    }
    formData.set('seller_id', user.id);

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/products`, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const json = await res.json();

        if (!res.ok) {
            showPopupMessage(json.message || 'Fehler beim Erstellen', 3000);
            return;
        }

        showPopupMessage('Produkt erfolgreich erstellt', 1500);
        fetchProducts();
        form.reset();
    } catch (err) {
        showPopupMessage('Netzwerkfehler beim Erstellen', 3000);
    }
}

document.getElementById('add-product-form').addEventListener('submit', addProduct);

async function loadCategoriesDropdown() {
    const res = await fetch('http://localhost:3000/api/categories');
    const { data } = await res.json();
    const select = document.querySelector('select[name="category_id"]');
    select.innerHTML = '<option value="">Please select:</option>';

    data.forEach(cat => {
        // Elternkategorie als fette Option
        const parentOption = document.createElement('option');
        parentOption.value = cat.id;
        parentOption.textContent = cat.name;
        parentOption.style.fontWeight = 'bold';
        select.appendChild(parentOption);

        // Kinderkategorien als normale Optionen
        if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = '↳ ' + child.name;
                select.appendChild(option);
            });
        }
    });
}

function renderProducts(products) {
    const container = document.getElementById('products-list');
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Bild</th>
                    <th>Name</th>
                    <th>Beschreibung</th>
                    <th>Preis</th>
                    <th>Aktionen</th>
                </tr>
            </thead>
            <tbody>
                ${products.map(product => {
        const primaryImage = product.images?.find(img => img.is_primary) || {};
        return `
                        <tr>
                            <td>
                               <img src="${primaryImage.url ? (primaryImage.url.startsWith('http') ? primaryImage.url : `http://${window.ROOT_URL}:3000${primaryImage.url}`) : '/images/placeholder.jpg'}" alt="${primaryImage.alt_text || ''}" width="60">
                            </td>
                            <td>${product.name}</td>
                            <td>${product.description}</td>
                            <td>${product.price} €</td>
                            <td class="actions">
                                <a href="/seller/${product.id}"><button class="edit-btn">Edit</button></a>
                                <a href="/product/${product.id}" ><button class="details-btn" >Details</button></a>
                                <button class="delete-btn" onclick="deleteProduct(${product.id})"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    `;
    }).join('')}
            </tbody>
        </table>
    `;
}

async function fetchMyProducts() {
    const res = await fetch('http://localhost:3000/api/products/mine', { credentials: 'include' });
    const json = await res.json();
    const products = Array.isArray(json) ? json : json.data;
    renderProducts(products || []);
}

async function deleteProduct(id) {
    // API request to delete
    await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    showPopupMessage('Product deleted successfully', 1500);
    fetchMyProducts(); // Reload the list
}

// --- Produktformular initialisieren (Dropdown für Seller) ---
document.addEventListener('DOMContentLoaded', () => {
    loadCategoriesDropdown();
    fetchMyProducts();
});

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    modal.innerHTML = '';
}
// --- Initialisierung ---
fetchProducts();
window.closeModal = closeModal;
window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
