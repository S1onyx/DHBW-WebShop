import { showPopupMessage } from './utils.js';

function getProductIdFromPath() {
    const match = window.location.pathname.match(/\/seller\/(\d+)/);
    return match ? match[1] : null;
}
const productId = getProductIdFromPath(); // Oder dynamisch aus URL holen

async function loadProduct() {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${productId}`);
    const product = await res.json();

    const catRes = await fetch('http://localhost:3000/api/categories');
    const { data: categories } = await catRes.json();

    // ID zur Kategorie finden
    let selectedCategoryId = '';
    categories.forEach(cat => {
        if (cat.name === product.data.category) selectedCategoryId = cat.id;
        if (cat.children) {
            cat.children.forEach(child => {
                if (child.name === product.data.category) selectedCategoryId = child.id;
            });
        }
    });

    await loadCategoriesDropdown(selectedCategoryId);

    document.querySelector('[name="name"]').value = product.data.name;
    document.querySelector('[name="description"]').value = product.data.description;
    document.querySelector('[name="stock"]').value = product.data.stock;
    document.querySelector('[name="price"]').value = product.data.price;
    document.querySelector('[name="category_id"]').value = product.data.category_id;

    // Bilder anzeigen
    const imagesDiv = document.getElementById('images-list');
    const images = product.data.images || [];
    imagesDiv.innerHTML = images.map(img =>
        `<img src="http://${window.ROOT_URL}:3000${img.url}" alt="${img.alt_text}" width="80" style="border:${img.is_primary ? '2px solid green' : '1px solid #ccc'};margin:4px;">`
    ).join('');


    await renderImages(images);
}

document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        description: form.description.value,
        stock: Number(form.stock.value),
        price: form.price.value,
        category: form.category_id.value
    };

    const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });

    if (res.ok) {
        showPopupMessage('Produkt erfolgreich aktualisiert!', 1500);
        history.back();
    } else {
        const err = await res.json();
        showPopupMessage(err.message || 'Fehler beim Aktualisieren', 2000);
    }
});

async function renderImages(images) {
    const imagesDiv = document.getElementById('images-list');
    imagesDiv.innerHTML = '';
    const imgs = Array.isArray(images) ? images : [];
    // Primary image zuerst
    imgs.sort((a, b) => b.is_primary - a.is_primary);
    imgs.forEach((img) => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-block';
        wrapper.style.margin = '4px';
        wrapper.innerHTML = `
            <img src="http://${window.ROOT_URL}:3000${img.url}" alt="${img.alt_text}" width="80" style="border:${img.is_primary ? '2px solid green' : '1px solid #ccc'};display:block;">
            <input type="text" value="${img.alt_text}" placeholder="Alt text" style="width:80px;margin:2px 0;" data-id="${img.id}">
            <button type="button" class="set-primary" ${img.is_primary ? 'disabled' : ''}>Primary</button>
            <button type="button" class="delete-img">Delete</button>
        `;
        // Alt-Text ändern
        wrapper.querySelector('input').addEventListener('change', async (e) => {
            await updateImage(img.id, { alt_text: e.target.value });
        });
        // Primary setzen
        wrapper.querySelector('.set-primary').addEventListener('click', async () => {
            await updateImage(img.id, { is_primary: true });
        });
        // Löschen
        wrapper.querySelector('.delete-img').addEventListener('click', async () => {
            if (confirm('Delete this image?')) {
                await deleteImage(img.id);
            }
        });
        imagesDiv.appendChild(wrapper);
    });
    // Bild hinzufügen
    const addDiv = document.createElement('div');
    addDiv.innerHTML = `
        <input type="file" accept="image/*" style="width:80px;">
        <button type="button" class="add-img">Add</button>
    `;
    addDiv.querySelector('.add-img').addEventListener('click', async () => {
        const fileInput = addDiv.querySelector('input[type="file"]');
        if (fileInput.files.length) {
            await uploadImage(fileInput.files[0]);
        }
    });
    addDiv.innerHTML = `
    <input type="file" accept="image/*" style="width:80px;">
    <input type="text" placeholder="Alt text" style="width:80px;margin:2px 0;">
    <button type="button" class="add-img">Add</button>
`;
    addDiv.querySelector('.add-img').addEventListener('click', async () => {
        const fileInput = addDiv.querySelector('input[type="file"]');
        const altInput = addDiv.querySelector('input[type="text"]');
        if (fileInput.files.length) {
            await uploadImage(fileInput.files[0], altInput.value);
        }
    });
    imagesDiv.appendChild(addDiv);
}
async function updateImage(imageId, data) {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/images/${imageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    if (res.ok) {
        showPopupMessage('Image updated!', 1200);
        await loadProduct();
    } else {
        showPopupMessage('Error updating image', 2000);
    }
}

// Delete image
async function deleteImage(imageId) {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    if (res.ok) {
        showPopupMessage('Image deleted!', 1200);
        await loadProduct();
    } else {
        showPopupMessage('Error deleting image', 2000);
    }
}

// Upload image with alt text
async function uploadImage(file, altText) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', altText || '');
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    if (res.ok) {
        showPopupMessage('Image added!', 1200);
        await loadProduct();
    } else {
        showPopupMessage('Error uploading image', 2000);
    }
}


async function loadCategoriesDropdown(selectedCategoryId) {
    const res = await fetch('http://localhost:3000/api/categories');
    const { data } = await res.json();
    const select = document.querySelector('select[name="category_id"]');
    select.innerHTML = '<option value="">Please select:</option>';

    data.forEach(cat => {
        const parentOption = document.createElement('option');
        parentOption.value = cat.id;
        parentOption.textContent = cat.name;
        parentOption.style.fontWeight = 'bold';
        if (String(cat.id) === String(selectedCategoryId)) parentOption.selected = true;
        select.appendChild(parentOption);

        if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = '↳ ' + child.name;
                if (String(child.id) === String(selectedCategoryId)) option.selected = true;
                select.appendChild(option);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProduct();
});