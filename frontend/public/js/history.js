const info = document.getElementById('info')

window.onload = () => loadHistory();

async function loadHistory() {
    try {
        const res = await fetch(`http://localhost:3000/api/orders`, {
            credentials: 'include'
        });

        if (!res.ok) throw new Error("History couldn't be loaded.");

        const result = await res.json();
        const history = result.data;

        if (!history) {
            info.textContent = 'Product not found';
            info.hidden = false;
            return;
        }


        try {
            const resMe = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, { credentials: 'include' });
            const json = await resMe.json();
            if (json.success) {
                if (json.data && json.data.role_id === 2) { // Seller-Check
                    // seller history
                } else {
                    await loadHistoryCustomer(history);
                }
            } else {

            }

        } catch (e) {
            info.textContent = 'Problem when getting user info.';
            info.hidden = false;
            return;
        }

    } catch {

    }
};

async function loadHistoryCustomer(history) {
    const historyElement = document.getElementById('history-list');
    history.forEach(async order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');

        const orderList = document.createElement('ul');
        orderList.classList.add('order-list');
        productsFromOrder(order, orderList);

        orderElement.innerHTML = `
            <h2 class="order-id">Order Id #${order.order_id}</h2>
            <p><strong>Order Date:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Order Total:</strong> ${order.total_price} €</p>
            <p><strong>Status:</strong> ${order.status}</p>
            `;


        orderElement.appendChild(orderList);
        historyElement.appendChild(orderElement);

    })
}

async function productsFromOrder(order, list) {
    order.items.forEach(async element => {
        const li = document.createElement('li');
        li.classList.add('order-product');
        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');

        try {
            const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${element.product_id}`);
            if (!res.ok) throw new Error('Produkt konnte nicht geladen werden');

            const result = await res.json();
            const product = result.data;
            const imageUrl = product.images[0].url;

            const thumbWrapper = document.createElement('div');
            thumbWrapper.className = 'picture';

            const img = document.createElement('img');
            img.src = imageUrl
                ? imageUrl.startsWith('http')
                    ? imageUrl
                    : `http://${window.ROOT_URL}:3000${imageUrl}`
                : '/images/placeholder.jpg';
            img.alt = element.name;
            img.className = 'product-thumb small-thumb';
            img.dataset.id = product.id;
            thumbWrapper.appendChild(img);
            li.appendChild(thumbWrapper);
        } catch {

        }

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action-container');

        const wishlistButton = document.createElement('button');
        wishlistButton.classList.add('button', 'wishlist-button');
        wishlistButton.textContent = "Add to Wishlist";
        wishlistButton.addEventListener('click', () => {
            /* Todo: Wishlist Action */
        })

        const cartButton = document.createElement('button');
        cartButton.classList.add('button', 'cart-button');
        cartButton.textContent = "Add to Cart";
        cartButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const id = getProductIdFromPath();

            const amount = amountInput.value.trim();
            if (isPositiveInteger(amount) && amount <= maxAmount) {
                amountInput.value = amount;
            } else {
                amountInput.value = 1;
            }

            try {
                const body = { productId: id, quantity: amount };
                const res = await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
                    ...fetchOptionsWithCredentials,
                    method: 'POST',
                    body: JSON.stringify(body)
                });
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
            } catch (err) {
                const serverError = document.getElementById('review-server-error');
                serverError.hidden = false;
            }
            showPopupMessage('Product was added to your cart', 1500);
        })

        actionContainer.appendChild(wishlistButton);
        actionContainer.appendChild(cartButton);

        const productTitle = document.createElement('h3');
        productTitle.classList.add('product-title-history')
        productTitle.textContent = element.name;

        dataContainer.appendChild(productTitle);

        const priceAndAmount = document.createElement('div');
        priceAndAmount.classList.add('price-amount-container')
        const price = document.createElement('p');
        price.classList.add('price');
        price.textContent = `${element.unit_price} €`;
        const amount = document.createElement('p');
        amount.classList.add('amount');
        amount.textContent = `Amount: ${element.quantity}`;

        priceAndAmount.appendChild(price);
        priceAndAmount.appendChild(amount);

        dataContainer.appendChild(priceAndAmount);

        dataContainer.appendChild(actionContainer);
        li.appendChild(dataContainer);
        li.addEventListener('click', (event) => {
            if (event.target.closest('button')) return;

            window.location.href = `/product/${element.product_id}`;
        });

        list.appendChild(li);
    });

}