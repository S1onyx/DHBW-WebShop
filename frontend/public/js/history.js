import { showPopupMessage } from "/js/utils.js";
import { showWishlistSelectModal } from '/js/wishlist-selection.js';

const info = document.getElementById('info')

window.onload = () => loadHistory("0");

async function loadHistory(statusId) {
    try {
        let url = `http://${window.ROOT_URL}:3000/api/orders`;
        if (statusId !== "0") {
            url += `?status=${statusId}`;
        }

        const res = await fetch(url, {
            credentials: 'include'
        });

        if (res.status === 404) {
            const list = document.getElementById('history-list');
            list.innerHTML = '';

            const errorInfo = document.createElement('p');
            errorInfo.classList.add('error-info');
            errorInfo.textContent = 'No orders with this status';

            list.appendChild(errorInfo);
            return
        } else if(!res.ok) {
            throw new Error("History couldn't be loaded.");
        }

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
                await loadHistoryCustomer(history);
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
    historyElement.innerHTML = '';
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
            showWishlistSelectModal(element.product_id, 1);
        })

        const cartButton = document.createElement('button');
        cartButton.classList.add('button', 'cart-button');
        cartButton.textContent = "Add to Cart";
        cartButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const id = element.product_id;

            const amount = 1;

            try {
                const body = { productId: id, quantity: amount };
                const res = await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
                    ...fetchOptionsWithCredentials,
                    method: 'POST',
                    body: JSON.stringify(body)
                });
                console.log(res);
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
            } catch (err) {
                const serverError = document.getElementById('server-error');
                serverError.textContent = "Server Error";
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

const statusDropdown = document.getElementById("status");

statusDropdown.addEventListener("change", (event) => {
  const statusID = event.target.value;

  loadHistory(statusID)
});

const fetchOptionsWithCredentials = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};
