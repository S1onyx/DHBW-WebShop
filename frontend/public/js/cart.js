import {showPopupMessage} from "/js/utils.js";

const fetchOptionsWithCredentials = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};

async function loadCart() {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/carts`, fetchOptionsWithCredentials);
    if (!res.ok) {
        document.body.insertAdjacentHTML('beforeend', '<p class="cart-error">Could not load cart.</p>');
        return;
    }
    const cart = await res.json();

    const cartDiv = document.createElement('div');
    cartDiv.className = 'cart-container';

    const main = document.querySelector('.main');

    // Check if a product is over the limit
    let canCheckout = true;

    cartDiv.innerHTML = `
    <h2 class="cart-title">Cart of ${cart.cartDetails.customer_name}</h2>
    <ul class="cart-list">
        ${cart.items.map(item => {
        const overLimit = item.quantity > item.stock;
        const atMax = item.quantity >= item.stock;

        if (overLimit) canCheckout = false;
        return `
    <li class="cart-item${overLimit ? ' cart-item-overstock' : ''}">
        <span class="cart-item-image"><img src="${item.image_url ? `http://${window.ROOT_URL}:3000${item.image_url}` : '/images/placeholder.jpg'}" alt="${item.alt_text || ''}" width="60"></span>
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-quantity">x${item.quantity}</span>
        <span class="cart-item-price">${parseFloat(item.price).toFixed(2)} €</span>
        <span class="cart-item-stock">In stock: <b>${item.stock}</b></span>
        <div class="cart-item-actions">
        ${overLimit ? '<span class="cart-product-warning">Not enough in stock!</span>' : `
            <button class="item-minus green-button" data-id="${item.id}"${item.quantity <= 1 ? ' disabled' : ''}>-</button>
            <input class="item-quantity-input" data-id="${item.id}" type="number" min="1" max="${item.stock}" value="${item.quantity}">
            <button class="item-plus green-button" data-id="${item.id}"${atMax ? ' disabled' : ''}>+</button>
        `}            
        <button class="item-delete red-button" data-id="${item.id}" title="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path fill="#fff" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/>
            </svg>
        </button>
    </li>
    `;
    }).join('')}
    </ul>
    <div class="cart-total">
        <strong>Total: ${cart.totalPrice.toFixed(2)} €</strong>
    </div>
    <div class="cart-actions">
        <button class="cart-delete-btn" id="deleteCartBtn" title="Delete cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path fill="#fff" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/>
            </svg>
        </button>
        <button class="cart-buy-btn" id="buyCartBtn"${canCheckout ? '' : ' disabled title="Not all products are available in sufficient quantity"'}>Buy</button>
    </div>
`;

    main.appendChild(cartDiv);

    cartDiv.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', async e => {
            const id = input.dataset.id;
            const min = 1;
            const max = parseInt(input.getAttribute('max'), 10);
            let quantity = parseInt(input.value, 10);

            if (isNaN(quantity) || quantity < min) {
                quantity = min;
            } else if (quantity > max) {
                quantity = max;
            }
            input.value = quantity;

            await updateQuantity(id, quantity);
        });
    });

    // Event listeners for item buttons
    cartDiv.querySelectorAll('.item-plus').forEach(btn => {
        btn.addEventListener('click', async e => {
            const id = btn.dataset.id;
            const input = cartDiv.querySelector(`.item-quantity-input[data-id="${id}"]`);
            let quantity = parseInt(input.value, 10) + 1;
            await updateQuantity(id, quantity);
        });
    });

    cartDiv.querySelectorAll('.item-minus').forEach(btn => {
        btn.addEventListener('click', async e => {
            const id = btn.dataset.id;
            const input = cartDiv.querySelector(`.item-quantity-input[data-id="${id}"]`);
            let quantity = Math.max(1, parseInt(input.value, 10) - 1);
            await updateQuantity(id, quantity);
        });
    });

    cartDiv.querySelectorAll('.item-quantity-input').forEach(input => {
        input.addEventListener('change', async e => {
            const id = input.dataset.id;
            let quantity = Math.max(1, parseInt(input.value, 10));
            await updateQuantity(id, quantity);
        });
    });

    cartDiv.querySelectorAll('.item-delete').forEach(btn => {
        btn.addEventListener('click', async e => {
            const id = btn.dataset.id;
            if (!confirm('Really remove product?')) return;
            await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
                ...fetchOptionsWithCredentials,
                method: 'DELETE',
                body: JSON.stringify({ itemId: id })
            });
            location.reload();
        });
    });

    async function updateQuantity(itemId, quantity) {
        await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
            ...fetchOptionsWithCredentials,
            method: 'PUT',
            body: JSON.stringify({ itemId, quantity })
        });
        location.reload();
    }

    document.getElementById('buyCartBtn').onclick = async () => {
        if (document.getElementById('buyCartBtn').disabled) return;
        const buyBtn = document.getElementById('buyCartBtn');
        buyBtn.disabled = true;
        buyBtn.innerHTML = `<span class="spinner"></span> Buying...`;

        const res = await fetch(`http://${window.ROOT_URL}:3000/api/orders`, {
            ...fetchOptionsWithCredentials,
            method: 'POST'
        });
        if (res.ok) {
            showPopupMessage('Purchase successful!');
            setTimeout(() => location.reload(), 1500);
        } else {
            showPopupMessage('Purchase failed.');
            buyBtn.disabled = false;
            buyBtn.innerHTML = 'Buy';
        }
    };

    document.getElementById('deleteCartBtn').onclick = async () => {
        if (!confirm('Really delete cart?')) return;
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/carts`, {
            ...fetchOptionsWithCredentials,
            method: 'DELETE'
        });
        if (res.ok) {
            await fetch(`http://${window.ROOT_URL}:3000/api/carts`, {
                ...fetchOptionsWithCredentials,
                method: 'POST'
            });
            location.reload();
        } else {
            alert('Delete failed.');
        }
    };
}

document.addEventListener('DOMContentLoaded', loadCart);