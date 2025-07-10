import { showPopupMessage } from "/js/utils.js";


export async function showWishlistSelectModal(productId, amount) {
    removeWishlistModal(); // bereits vorhandenes Modal entfernen

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'wishlist-modal-overlay';
    modalOverlay.classList.add('modal-overlay');

    const modal = document.createElement('div');
    modal.id = 'wishlist-modal';
    modal.classList.add('modal');

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.classList.add('modal-close-button');
    closeBtn.addEventListener('click', removeWishlistModal);
    modal.appendChild(closeBtn);

    const headline = document.createElement('h3');
    headline.textContent = 'Choose Wishlists';
    modal.appendChild(headline);

    const wishlistContainer = document.createElement('div');
    wishlistContainer.classList.add('wishlist-container');

    const { ownWishlists, sharedWishlists } = await loadWishlistsForSelection();

    wishlistContainer.appendChild(createWishlistSection('Your Wishlists', ownWishlists));
    wishlistContainer.appendChild(createWishlistSection('Shared Wishlists', sharedWishlists));

    modal.appendChild(wishlistContainer);

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Add to Selected';
    submitBtn.classList.add('wishlist-modal-button', 'button');
    submitBtn.addEventListener('click', async () => {
        const selected = modal.querySelectorAll('input[type="checkbox"]:checked');
        if (selected.length === 0) {
            showPopupMessage('Please select at least one wishlist.', 'error');
            return;
        }

        const requests = [];

        for (const checkbox of selected) {
            const wishlistId = checkbox.value;

            const req = fetch(`http://${window.ROOT_URL}:3000/api/wishlists/${wishlistId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    product_id: productId,
                    quantity: amount
                })
            });

            requests.push(req);
        }

        try {
            await Promise.all(requests);
            showPopupMessage('Product successfully added to wishlist(s)');
            removeWishlistModal();
        } catch (error) {
            console.error('Failed to add product to wishlists:', error);
            showPopupMessage('Failed to add product to wishlist(s)');
        }
    });

    modal.appendChild(submitBtn); // wichtig!
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
}

export function removeWishlistModal() {
    const existing = document.getElementById('wishlist-modal-overlay');
    if (existing) existing.remove();
}

async function loadWishlistsForSelection() {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/wishlist`, {
        credentials: 'include'
    });

    const wishlists = await res.json();

    const ownWishlists = wishlists.filter(w => w.permission_id === 0);
    const sharedWishlists = wishlists.filter(w => w.permission_id === 2); // nur Schreibrechte

    return { ownWishlists, sharedWishlists };
}


function createWishlistSection(title, wishlists) {
    const section = document.createElement('details');
    section.classList.add('wishlist-section');
    section.open = true;

    const summary = document.createElement('summary');
    summary.textContent = `${title} (${wishlists.length})`;
    section.appendChild(summary);

    const list = document.createElement('ul');
    list.classList.add('wishlist-list');

    for (const w of wishlists) {
        const li = document.createElement('li');
        const label = document.createElement('label');
        label.classList.add('wishlist-entry');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = w.wishlist_id;

        const name = document.createElement('span');
        name.classList.add('wishlist-selection-name');
        name.textContent = w.wishlist_name;

        label.appendChild(checkbox);
        label.appendChild(name);
        li.appendChild(label);
        list.appendChild(li);
    }

    section.appendChild(list);
    return section;
}
