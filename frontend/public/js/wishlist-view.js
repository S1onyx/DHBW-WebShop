import { showPopupMessage } from "/js/utils.js";

const info = document.getElementById('info')

const serverError = document.getElementById("server-error");
const productsList = document.getElementById("products-list");
const titleElement = document.getElementById("wishlist-title");
const deleteModal = document.getElementById('delete-wishlist-modal');
let wishlistid;
let selectedProduct;


window.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const wishlistID = urlParams.toString().replace("=", "");

    if (!wishlistID) {
        info.textContent = "Invalid wishlist ID.";
        info.hidden = false;
        return;
    }

    wishlistid = wishlistID;

    loadWishList(wishlistID);
});

async function loadWishList(wishlistID) {
    try {

        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistID}/items`, {
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
        } else if (!res.ok) {
            throw new Error("Wishlist couldn't be loaded.");
        }

        const result = await res.json();
        const wishlistName = result.data.wishlist_name;
        const access = result.data.access;
        const totalPrice = result.data.total_price;
        const ownerName = result.data.owner_username;
        const wishlist = result.data.items;

        document.getElementById('wishlist-name').textContent = wishlistName;
        document.getElementById('wishlist-owner').textContent = ownerName;
        document.getElementById('wishlist-access').textContent = access;
        document.getElementById('wishlist-total').textContent = totalPrice + " €";

        if (!wishlist) {
            info.textContent = 'Product not found';
            info.hidden = false;
            return;
        }
        const list = document.getElementById('products-list');


        await loadWishlistItems(wishlistID, wishlist, list, access);

    } catch {

    }
};

async function loadWishlistItems(wishlistID, wishlist, list, access) {
    console.log(wishlist);
    wishlist.forEach(async element => {
        const li = document.createElement('li');
        li.classList.add('wishlist-product');
        const dataContainer = document.createElement('div');
        dataContainer.classList.add('data-container');

        const imageUrl = element.primary_image;

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
        img.dataset.id = element.product_id;
        thumbWrapper.appendChild(img);
        li.appendChild(thumbWrapper);

        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action-container');

        const cartButton = document.createElement('button');
        cartButton.classList.add('button', 'cart-button');
        cartButton.textContent = "Add to Cart";
        cartButton.addEventListener('click', async (event) => {
            event.preventDefault();
            const id = element.product_id;

            const amount = element.quantity;

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

        actionContainer.appendChild(cartButton);

        if (access !== "readOnly") {
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
            deleteBtn.title = "Delete wishlist";

            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();

                selectedProduct = element.product_id;
                deleteModal.classList.remove('hidden');


            });

            deleteBtn.addEventListener('mouseenter', () => {
                li.classList.add('delete-hover');
            });
            deleteBtn.addEventListener('mouseleave', () => {
                li.classList.remove('delete-hover');
            });

            actionContainer.appendChild(deleteBtn);
        }


        const productTitle = document.createElement('h3');
        productTitle.classList.add('product-title-history')
        productTitle.textContent = element.name;

        dataContainer.appendChild(productTitle);

        const priceAndAmount = document.createElement('div');
        priceAndAmount.classList.add('price-amount-container')
        const price = document.createElement('p');
        price.classList.add('price');
        price.textContent = `${element.price} €`;
        priceAndAmount.appendChild(price);


        if (access === "readOnly") {
            const amount = document.createElement('p');
            amount.classList.add('amount');
            amount.textContent = `Amount: ${element.quantity}`;
            priceAndAmount.appendChild(amount);
        } else {
            try {
                const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${element.product_id}`);
                if (!res.ok) throw new Error('Produkt konnte nicht geladen werden');

                const result = await res.json();
                const product = result.data;
                const maxAmount = product.stock;

                const amount = document.createElement('div');
                amount.innerHTML = `
                    <div class="arrow-wrapper" style="display: flex; align-items: center; gap: 10px;">
                        <div class="arrow amount-less" style="cursor: pointer; user-select: none;">
                            <i class="fa-solid fa-arrow-left"></i>
                        </div>
                        <input id="amount-input" class="amount-input" type="number" value="${element.quantity}" min="1">
                        <div class="arrow amount-more" style="cursor: pointer; user-select: none;">
                        <i class="fa-solid fa-arrow-right"></i>
                        </div>
                    </div>
                `;

                // Elemente selektieren (relativ zum amount-Container)
                const amountInput = amount.querySelector('.amount-input');
                const lessBtn = amount.querySelector('.amount-less');
                const moreBtn = amount.querySelector('.amount-more');

                // Event Listener hinzufügen
                lessBtn.addEventListener('click', async () => {
                    let currentAmount = parseInt(amountInput.value) || 1;
                    if (currentAmount > 1) {
                        amountInput.value = currentAmount - 1;
                    } else {
                        amountInput.value = maxAmount;
                    }

                    try {
                        const body = { product_id: element.product_id, quantity: amountInput.value };
                        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistID}/items`, {
                            ...fetchOptionsWithCredentials,
                            method: 'PUT',
                            body: JSON.stringify(body)
                        });

                        element.quantity = amountInput.value;

                        console.log(res);
                        /*if (res.status === 401) {
                            window.location.href = '/login';
                            return;
                        }*/
                    } catch (err) {
                        const serverError = document.getElementById('server-error');
                        serverError.textContent = "Server Error";
                        serverError.hidden = false;
                    }
                });

                moreBtn.addEventListener('click', async () => {
                    let currentAmount = parseInt(amountInput.value) || 1;
                    if (currentAmount < maxAmount) {
                        amountInput.value = currentAmount + 1;
                    } else {
                        amountInput.value = 1;
                    }

                    try {
                        const body = { product_id: element.product_id, quantity: amountInput.value };
                        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistID}/items`, {
                            ...fetchOptionsWithCredentials,
                            method: 'PUT',
                            body: JSON.stringify(body)
                        });

                        console.log(res);

                        element.quantity = amountInput.value;

                        /*if (res.status === 401) {
                            window.location.href = '/login';
                            return;
                        }*/
                    } catch (err) {
                        const serverError = document.getElementById('server-error');
                        serverError.textContent = "Server Error";
                        serverError.hidden = false;
                    }
                });

                amountInput.addEventListener('input', async () => {
                    let currentAmount = parseInt(amountInput.value);
                    if (currentAmount < 1) {
                        amountInput.value = 1;
                    } else if (currentAmount > maxAmount) {
                        amountInput.value = maxAmount;
                    }

                    try {
                        const body = { product_id: element.product_id, quantity: amountInput.value };
                        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistID}/items`, {
                            ...fetchOptionsWithCredentials,
                            method: 'PUT',
                            body: JSON.stringify(body)
                        });

                        element.quantity = amountInput.value;

                        console.log(res);
                        /*if (res.status === 401) {
                            window.location.href = '/login';
                            return;
                        }*/
                    } catch (err) {
                        const serverError = document.getElementById('server-error');
                        serverError.textContent = "Server Error";
                        serverError.hidden = false;
                    }
                });

                priceAndAmount.appendChild(amount);
            } catch (error) {
            }
        }


        dataContainer.appendChild(priceAndAmount);

        dataContainer.appendChild(actionContainer);
        li.appendChild(dataContainer);
        li.addEventListener('click', (event) => {
            if (
                event.target.closest('button') ||
                event.target.closest('.arrow-wrapper')
            ) return;


            window.location.href = `/product/${element.product_id}`;
        });

        list.appendChild(li);
    });

}

/* delete Button */
deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
        deleteModal.classList.add('hidden');
    }
});

document.getElementById('delete-cancel-btn').addEventListener('click', () => {
    deleteModal.classList.add('hidden');
});

document.getElementById('delete-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const body = { product_id: selectedProduct};
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistid}/items`, {
            method: 'DELETE',
            credentials: 'include',
            body: JSON.stringify(body)
        });
        if (res.ok) {
            deleteModal.classList.add('hidden');
            showPopupMessage("Deleted Product from Wishlist");
            window.location.reload();
        } else {
            showPopupMessage('Error deleting Product from Wishlist')
        }
    } catch {
        alert('Server error.');
    }
});

const fetchOptionsWithCredentials = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};