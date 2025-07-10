import { showPopupMessage } from "/js/utils.js";

const deleteModal = document.getElementById('delete-wishlist-modal');
const addBtn = document.querySelector('.add-wishlist-btn');
const wishlistModal = document.getElementById('wishlist-modal');
const cancelBtn = document.getElementById('wishlist-cancel-btn');
const form = document.getElementById('wishlist-form');

let selectedWishlistId = null;


window.onload = () => loadWishlists();

async function loadWishlists() {
    try {
        let url = `http://localhost:3000/api/orders`;


        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/wishlist`, {
            credentials: 'include'
        });

        if (res.status === 404) {

            return
        } else if (!res.ok) {
            throw new Error("Wishlists couldn't be loaded.");
        }

        const wishlists = await res.json();

        const permission0 = wishlists.filter(w => w.permission_id === 0);
        const permission1 = wishlists.filter(w => w.permission_id === 1);
        const permission2 = wishlists.filter(w => w.permission_id === 2);

        renderWishlists(permission0, 'perm-0');
        renderWishlists(permission1, 'perm-1');
        renderWishlists(permission2, 'perm-2');

        console.log('permission 0:', permission0);
        console.log('permission 1:', permission1);
        console.log('permission 2:', permission2);

        if (!wishlists) {
            info.textContent = 'Product not found';
            info.hidden = false;
            return;
        }


    } catch {

    }

}

function renderWishlists(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (list.length === 0) {
        container.textContent = 'No wishlists of this type';
        return;
    }

    list.forEach(w => {
        const item = document.createElement('div');
        item.classList.add('wishlist-item');
        item.style.cursor = 'pointer';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('wishlist-content');
        contentDiv.innerHTML = `
            <h3>${w.wishlist_name}</h3>
            <p>Owner: ${w.owner_name}</p>
            <p>Total value: ${w.total_value} €</p>
            <p>Products: ${w.different_products_count}</p>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('wishlist-actions');

        if (w.permission_id === 0) {
            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
            deleteBtn.title = "Delete wishlist";

            deleteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();

                selectedWishlistId = w.wishlist_id;
                deleteModal.classList.remove('hidden');


            });

            // Delete-Hover-Effekt für Hintergrund
            deleteBtn.addEventListener('mouseenter', () => {
                item.classList.add('delete-hover');
            });
            deleteBtn.addEventListener('mouseleave', () => {
                item.classList.remove('delete-hover');
            });


            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
            editBtn.title = "Edit wishlist";
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `/wishlist/edit/${w.wishlist_id}`;
            });

            // Access Button
            const accessBtn = document.createElement('button');
            accessBtn.classList.add('access-btn');
            accessBtn.innerHTML = `<i class="fa-solid fa-user-gear"></i>`;
            accessBtn.title = "Change access permissions";
            accessBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `/wishlist/access/${w.wishlist_id}`;
            });

            actionsDiv.append(accessBtn, editBtn, deleteBtn);
        }

        item.append(contentDiv, actionsDiv);

        item.addEventListener('click', () => {
            window.location.href = `/wishlist/${w.wishlist_id}`;
        });

        container.appendChild(item);
    });
}


document.querySelectorAll('.toggle-button').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const section = document.getElementById(targetId);
        section.classList.toggle('hidden');
    });
});

/* Add Wishlist */

addBtn.addEventListener('click', () => {
    wishlistModal.classList.remove('hidden');
});


wishlistModal.addEventListener('click', (e) => {
    if (e.target === wishlistModal) {
        wishlistModal.classList.add('hidden');
    }
});


cancelBtn.addEventListener('click', () => {
    wishlistModal.classList.add('hidden');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('wishlist-name').value.trim();
    if (!name) {
        const nameError = document.getElementById('wishlist-name-error');
        document.getElementById('wishlist-name').classList.add('input-error')
        nameError.textContent = "Please enter a name for the wishlist";
        return;
    }

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/wishlist`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        if (res.ok) {
            wishlistModal.classList.add('hidden');
            showPopupMessage('Created Wishlist')
            window.location.reload();
        } else {
            showPopupMessage('Failed to create Wishlist')
        }
    } catch {
        alert('Server error');
    }
});

wishlistModal.addEventListener('click', (e) => {
    const nameInput = document.getElementById('wishlist-name');
    const nameError = document.getElementById('wishlist-name-error');

    nameInput.classList.remove('input-error');
    nameError.textContent = '';

});

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
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/wishlists/wishlist/${selectedWishlistId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            deleteModal.classList.add('hidden');
            showPopupMessage("Deleted Wishlist");
            window.location.reload();
        } else {
            showPopupMessage('Error deleting Wishlist')
        }
    } catch {
        alert('Server error.');
    } 
});



