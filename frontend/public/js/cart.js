const fetchOptionsWithCredentials = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};

async function loadCart() {
    const res = await fetch('http://localhost:3000/api/carts', fetchOptionsWithCredentials);
    if (!res.ok) {
        document.body.insertAdjacentHTML('beforeend', '<p class="cart-error">Warenkorb konnte nicht geladen werden.</p>');
        return;
    }
    const cart = await res.json();

    const cartDiv = document.createElement('div');
    cartDiv.className = 'cart-container';

    const main = document.querySelector('.main');

    cartDiv.innerHTML = `
        <h2 class="cart-title">Warenkorb von ${cart.cartDetails.customer_name}</h2>
        <ul class="cart-list">
            ${cart.items.map(item => `
                <li class="cart-item">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-quantity">x${item.quantity}</span>
                    <span class="cart-item-price">${parseFloat(item.price).toFixed(2)} €</span>
                </li>
            `).join('')}
        </ul>
        <div class="cart-total">
            <strong>Gesamt: ${cart.totalPrice.toFixed(2)} €</strong>
        </div>
        <div class="cart-actions">
            <button class="cart-delete-btn" id="deleteCartBtn" title="Warenkorb löschen">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path fill="#fff" d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z"/>
                </svg>
            </button>
            <button class="cart-buy-btn" id="buyCartBtn">Kaufen</button>
        </div>
    `;

    main.appendChild(cartDiv);

    document.getElementById('buyCartBtn').onclick = async () => {
        const res = await fetch('http://localhost:3000/api/orders', {
            ...fetchOptionsWithCredentials,
            method: 'POST'
        });
        if (res.ok) {
            alert('Kauf erfolgreich!');
            location.reload();
        } else {
            alert('Kauf fehlgeschlagen.');
        }
    };

    document.getElementById('deleteCartBtn').onclick = async () => {
        if (!confirm('Warenkorb wirklich löschen?')) return;
        const res = await fetch('http://localhost:3000/api/carts', {
            ...fetchOptionsWithCredentials,
            method: 'DELETE'
        });
        if (res.ok) {
            // Direkt neuen leeren Warenkorb anlegen
            await fetch('http://localhost:3000/api/carts', {
                ...fetchOptionsWithCredentials,
                method: 'POST'
            });
            alert('Warenkorb gelöscht.');
            location.reload();
        } else {
            alert('Löschen fehlgeschlagen.');
        }
    };
}

document.addEventListener('DOMContentLoaded', loadCart);