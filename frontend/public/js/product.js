import { showPopupMessage } from "/js/utils.js";

const title = document.getElementById('title');
const seller = document.getElementById('seller');
const description = document.getElementById('product-description');
const price = document.getElementById('price');
const productImage = document.getElementById('product-image');
const reviewList = document.getElementById('review-list');

const cartButton = document.getElementById('cart-button');

const amountBuyWrapper = document.getElementById('amount-buy-wrapper');
const lowAvailabilityInfo = document.getElementById('low-availibility-info');
const amountInput = document.getElementById('amount');
const lessBtn = document.getElementById('amount-less');
const moreBtn = document.getElementById('amount-more');
let maxAmount;

const prevPictureButton = document.getElementById('picture-left');
const nextPictureButton = document.getElementById('picture-right');

let imageUrls;
let currentImageIndex = 0;

window.onload = () => loadProduct();

function isPositiveInteger(value) {
    return Number.isInteger(value) && value > 0;
}

cartButton.addEventListener('click', async function (event) {
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

// Reviews
const textarea = document.getElementById('review-input');
const reviewRating = document.getElementById('review-rating');

textarea.addEventListener('focus', () => {
    const commentError = document.getElementById('comment-error');
    commentError.hidden = true;
    textarea.classList.remove('input-error');
})

document.getElementById('review-rating').addEventListener('focus', (event) => {
    const ratingError = document.getElementById('rating-error');
    ratingError.hidden = true;
    reviewRating.classList.remove('input-error');
})

document.getElementById('new-review-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const id = getProductIdFromPath();

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const json = await res.json();
        if (!json.success) {
            if (json.code === 401) {
                setTimeout(() => {
                    window.location.href = `http://localhost:1337/login`;
                }, 100);
            }
        }
    } catch (err) {
        const serverError = document.getElementById('review-server-error');
        serverError.hidden = false;
    }

    let isComment = true;
    if (!textarea.value.trim()) {
        isComment = false;
        const commentError = document.getElementById('comment-error');
        commentError.hidden = false;
        textarea.classList.add('input-error');
    }

    let isRating = true;
    let ratingNumber = parseFloat(reviewRating.value.trim().replace(',', '.'));
    const isStepValid = Number.isFinite(ratingNumber) && (ratingNumber * 2) % 1 === 0;

    if (!reviewRating.value.trim() || ratingNumber > 5.0 || ratingNumber < 0.0 || !isStepValid) {
        isRating = false;
        const ratingError = document.getElementById('rating-error');
        ratingError.hidden = false;
        if (ratingNumber > 5.0 || ratingNumber < 0.0 || !isStepValid) {
            ratingError.textContent = "Rating must be a number from 0 to 5, with 0.5 steps!";
        } else {
            ratingError.textContent = "Add Rating!";
        }
        reviewRating.classList.add('input-error');
    }


    if (!isComment || !isRating) {
        return;
    }

    const body = { rating: ratingNumber, comment: textarea.value.trim() };

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${id}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        });

        const json = await res.json();
        if (!json.success) {
            if (json.code === 401) {
                setTimeout(() => {
                    window.location.href = 'login';
                }, 1000);
            } else if(json.code === 409) {
                const conflictError = document.getElementById('review-conflict-error');
                conflictError.hidden = false;
            }
        } else {
            window.location.reload();
        }
    } catch (err) {
        const serverError = document.getElementById('review-server-error');
        serverError.hidden = false;
    }
});

document.getElementById('reviews-container').addEventListener('click', (event) => {
    const clickedElement = event.target;
    const conflictError = document.getElementById('review-conflict-error');
    conflictError.hidden = true;

});


textarea.addEventListener('input', () => {
    textarea.style.height = 'auto'; // zurücksetzen
    textarea.style.height = textarea.scrollHeight + 'px';
});

// Amount
lessBtn.addEventListener('click', () => {
    let currentAmount = parseInt(amountInput.value) || 1;
    if (currentAmount > 1) {
        amountInput.value = currentAmount - 1;
    } else {
        amountInput.value = maxAmount;
    }
});

moreBtn.addEventListener('click', () => {
    let currentAmount = parseInt(amountInput.value) || 1;
    if (currentAmount < maxAmount) {
        amountInput.value = currentAmount + 1;
    } else {
        amountInput.value = 1;
    }
});

amountInput.addEventListener('input', () => {
    let currentAmount = parseInt(amountInput.value);
    if (currentAmount < 1) {
        amountInput.value = 1;
    } else if (currentAmount > maxAmount) {
        amountInput.value = maxAmount;
    }

})

// Image Carusell
prevPictureButton.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
    showImage(currentImageIndex);
});

nextPictureButton.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    showImage(currentImageIndex);
});

function showImage(index) {
    if (!imageUrls.length) return;

    productImage.classList.add('fade-out');

    setTimeout(() => {
        productImage.src = imageUrls[index];
        productImage.alt = title.textContent || 'Produktbild';

        productImage.classList.remove('fade-out');
    }, 200); // Wartezeit = Dauer der CSS-Transition
}

// loadProduct at window load
async function loadProduct() {
    const id = getProductIdFromPath();
    if (!id) return;

    title.textContent = 'Produkt wird geladen...';

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${id}`);
        if (!res.ok) throw new Error('Produkt konnte nicht geladen werden');

        const result = await res.json();
        const product = result.data;

        if (!product) {
            title.textContent = 'Produkt nicht gefunden.';
            return;
        }

        // Produktinfos anzeigen
        title.textContent = product.name;
        seller.textContent = product.seller_name || '';
        description.textContent = product.description;
        price.textContent = `${product.price}€`;

        loadAmount(product);

        // Bilder anzeigen
        imageUrls = extractImageUrls(product);
        showImage(currentImageIndex);

        try {
            const res = await fetch(`http://${window.ROOT_URL}:3000/api/products/${id}/reviews`);
            if (!res.ok) throw new Error('Reviews konnte nicht geladen werden');

            const result = await res.json();
            const reviews = result.data;

            renderReviews(reviews, product.averageRating);
        } catch {
            const serverError = document.getElementById('review-server-error');
            serverError.hidden = false;
        }

        // Produkte laden
        loadCategoryMap();
        otherProductsLoad(1, { category: 3 });

    } catch (error) {
        title.textContent = `Fehler : ${error.message}`;
    }

}

function getProductIdFromPath() {
    const match = window.location.pathname.match(/\/product\/(\d+)/);
    return match ? match[1] : null;
}

function loadAmount(product) {
    maxAmount = product.stock;
    if (maxAmount == 0) {
        const message = document.createElement('p');
        message.textContent = "Product not available right now"
        message.classList = 'availability-info not-available'

        amountBuyWrapper.replaceWith(message);
        cartButton.remove();
    } else if (maxAmount <= 3) {
        lowAvailabilityInfo.textContent = `Only ${maxAmount} more available`
        lowAvailabilityInfo.hidden = false;
    }
}


function extractImageUrls(product) {
    if (product.images && product.images.length > 0) {
        return product.images.map(img => {
            const url = img.url;
            return url.startsWith('http')
                ? url
                : `http://${window.ROOT_URL}:3000${url}`;
        });
    } else if (product.image_url) {
        return [
            product.image_url.startsWith('http')
                ? product.image_url
                : `http://${window.ROOT_URL}:3000${product.image_url}`
        ];
    }
    return [];
}

function reviewStars(starClass, rating, element, ratingInfoClass) {
    let rating_safe = rating;
    for (let i = 0; i < 5; i++) {
        const star = document.createElement('i');
        star.classList.add(starClass);
        if (rating >= 0.8) {
            star.classList.add('fa-star', 'fa-solid');
            rating--;
        } else if (rating < 0.8 && rating > 0.2) {
            star.classList.add('fa-star-half-stroke', 'fa-solid')
            rating--;
        } else if (rating <= 0.2) {
            star.classList.add('fa-regular', 'fa-star')
        }

        element.appendChild(star);
    }

    const ratingInfo = document.createElement('p');
    ratingInfo.textContent = `(${rating_safe.toFixed(1)})`;
    ratingInfo.classList.add(ratingInfoClass);
    element.appendChild(ratingInfo);
}

async function renderReviews(reviews, averageRating) {
    reviewList.innerHTML = '';

    const starsContainer = document.getElementById('stars');
    reviewStars("average-star", parseFloat(averageRating), starsContainer, 'average-rating-info');

    let loggedin = false;
    let username;

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });

        const json = await res.json();
        if (json.success) {
            loggedin = true;
            username = json.data.username;
        } else {
            loggedin = false;
        }
    } catch (err) {
        const serverError = document.getElementById('review-server-error');
        serverError.hidden = false;
    }

    if (Array.isArray(reviews) && reviews.length > 0) {
        let id = 0;
        reviews.forEach(review => {
            const li = document.createElement('li');
            li.id = `review${id}`

            const starRatingContainer = document.createElement('div');
            starRatingContainer.classList.add('star-rating-container');
            reviewStars("review-star", parseFloat(review.rating), starRatingContainer, 'rating-info');

            const name = document.createElement('p');
            name.textContent = review.customer_name;
            name.classList.add('review-name');
            starRatingContainer.appendChild(name);

            li.classList.add('review');

            const reviewContainer = document.createElement('div');
            reviewContainer.classList.add('review-container');
            reviewContainer.appendChild(starRatingContainer);

            const comment = document.createElement('p');
            comment.textContent = review.comment;
            comment.classList.add('review-comment');
            reviewContainer.appendChild(comment);
            li.appendChild(reviewContainer);

            if (loggedin && review.customer_name == username) {
                const editButton = document.createElement('button');
                editButton.classList.add('button', 'review-edit-button', 'review-button');
                editButton.textContent = 'Edit';

                const deleteButton = document.createElement('button');
                deleteButton.classList.add('button', 'review-delete-button', 'review-button');
                deleteButton.textContent = 'Delete';

                editButton.addEventListener('click', (event) => {
                    event.preventDefault();

                    const oldComment = li.querySelector('.review-comment')?.textContent ?? '';
                    const ratingTextRaw = li.querySelector('.rating-info')?.textContent ?? '';
                    const cleanedRatingText = ratingTextRaw.replace(/[()]/g, '');
                    const oldRating = parseFloat(cleanedRatingText);

                    const originalLi = li.cloneNode(true); 


                    const form = document.createElement('form');
                    form.innerHTML = `
                    <p id="update-comment-error" class="input-error-message" hidden>Add Comment!</p>
                    <textarea id="update-review-input" class="review-input" rows="1" placeholder="Your Review..."></textarea>
                    <p id="update-rating-error" class="input-error-message" hidden>Add Rating!</p>
                    <div class="rating-submit-wrapper">
                        <input type="number" id="update-review-rating" class="review-rating" placeholder="Rating">
                        <input type="submit" class="button submit-review-button" id="update-review-button" value="Update Review">
                        <button type="button" id="cancel-button" class="button">Cancel</button>
                    </div>`;

                    form.querySelector('#update-review-input').value = oldComment;
                    form.querySelector('#update-review-rating').value = oldRating;

                    const updateButton = form.querySelector('#update-review-button');
                    const cancelButton = form.querySelector('#cancel-button');

                    const updateTextarea = form.querySelector('#update-review-input');
                    const updateRatingInput = form.querySelector('#update-review-rating');

                    updateTextarea.addEventListener('focus', () => {
                        const commentError = document.getElementById('update-comment-error');
                        commentError.hidden = true;
                        updateTextarea.classList.remove('input-error');
                    });

                    updateRatingInput.addEventListener('focus', () => {
                        const ratingError = document.getElementById('update-rating-error');
                        ratingError.hidden = true;
                        updateRatingInput.classList.remove('input-error');
                    });

                    updateButton.addEventListener('click', async (e) => {
                        e.preventDefault();
                        const newComment = form.querySelector('#update-review-input');

                        let isComment = true;
                        if (!newComment.value.trim()) {
                            isComment = false;
                            const reviewError = document.getElementById('update-comment-error');
                            reviewError.hidden = false;
                            newComment.classList.add('input-error');
                        }
                        const newRating = parseFloat(form.querySelector('#update-review-rating').value.trim().replace(',', '.'));
                        const reviewRating = form.querySelector('#update-review-rating');
                        const isStepValid = Number.isFinite(newRating) && (newRating * 2) % 1 === 0;

                        let isRating = true;
                        if (!reviewRating.value.trim() || newRating > 5.0 || newRating < 0.0 || !isStepValid) {
                            isRating = false;
                            const ratingError = document.getElementById('update-rating-error');
                            ratingError.hidden = false;
                            if (newRating > 5.0 || newRating < 0.0 || !isStepValid) {
                                ratingError.textContent = "Rating must be a number from 0 to 5 with 0.5 steps!";
                            } else {
                                ratingError.textContent = "Add Rating!";
                            }
                            reviewRating.classList.add('input-error');
                        }


                        if (!isComment || !isRating) {
                            return;
                        }



                        const body = { comment: newComment.value.trim(), rating: newRating };
                        console.log(JSON.stringify(body));
                        const reviewID = review.id;
                        try {
                            const res = await fetch(`http://${window.ROOT_URL}:3000/api/reviews/${review.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include',
                                body: JSON.stringify(body)
                            });

                            const json = await res.json();
                            if (!json.success) {

                            } else {
                                window.location.reload();
                            }
                        } catch (err) {
                            const serverError = document.getElementById('review-server-error');
                            serverError.hidden = false;
                        }


                        location.reload();
                    });

                    cancelButton.addEventListener('click', () => {
                        location.reload();
                    });


                    li.replaceWith(form);

                });

                deleteButton.addEventListener('click', async (event) => {
                    event.preventDefault();

                    try {
                            const res = await fetch(`http://${window.ROOT_URL}:3000/api/reviews/${review.id}`, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });

                            const json = await res.json();
                            if (!json.success) {

                            } else {
                                window.location.reload();
                            }
                        } catch (err) {
                            const serverError = document.getElementById('review-server-error');
                            serverError.hidden = false;
                        }
                })

                const buttonContainer = document.createElement('div');
                buttonContainer.classList.add('button-container');
                buttonContainer.appendChild(editButton);
                buttonContainer.appendChild(deleteButton);

                li.appendChild(buttonContainer);

            }

            reviewList.appendChild(li);
            id++;
        });
    } else {
        reviewList.innerHTML = "<li>No reviews yet.</li>";
    }
}

async function otherProductsLoad(categoryId, options = {}) {
    let amount = 9;

    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '<li>Loading products...</li>';

    const params = new URLSearchParams();
    if (categoryId) params.append('category', categoryId);
    if (options.name) params.append('name', options.name);
    if (typeof options.minPrice === 'number') params.append('minPrice', options.minPrice);
    if (typeof options.maxPrice === 'number') params.append('maxPrice', options.maxPrice);
    if (options.inStock === true) params.append('inStock', true);
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);

    params.append('limit', amount);
    params.append('offset', 0);

    try {
        const response = await fetch(`http://${window.ROOT_URL}:3000/api/products?${params.toString()}`);
        if (!response.ok) throw new Error('Fehler beim Abrufen der Produkte');
        const result = await response.json();
        const products = result.data || [];
        const total = result.total || products.length;

        if (products.length === 0) {
            productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
            renderPagination(total, page);
            updateActiveFiltersUI();
            return;
        }

        productList.innerHTML = '';

        products.forEach(product => {
            const li = document.createElement('li');
            li.className = 'product-card';

            const productInfoOverlay = document.createElement('div');
            productInfoOverlay.className = 'product-info-overlay';
            productInfoOverlay.textContent = 'Product Page';

            const link = document.createElement('a');
            link.href = `/product/${product.id}`;
            link.className = 'product-link';

            // Produktbild
            const thumbWrapper = document.createElement('div');
            thumbWrapper.className = 'product-thumb-wrapper';

            const img = document.createElement('img');
            const imageUrl = product.image_url;
            img.src = imageUrl
                ? imageUrl.startsWith('http')
                    ? imageUrl
                    : `http://${window.ROOT_URL}:3000${imageUrl}`
                : '/images/placeholder.jpg';
            img.alt = product.name;
            img.className = 'product-thumb small-thumb';
            img.dataset.id = product.id;

            // Klick-Event für das Bild
            img.addEventListener('click', async function (event) {
                event.preventDefault();
                const body = { productId: product.id, quantity: 1 };
                const res = await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
                    ...fetchOptionsWithCredentials,
                    method: 'POST',
                    body: JSON.stringify(body)
                });
                if (res.status === 401) {
                    window.location.href = '/login';
                    return;
                }
                showPopupMessage('Product was added to your cart', 1500);
            });

            const buyOverlay = document.createElement('div');
            buyOverlay.className = 'buy-overlay';
            buyOverlay.textContent = 'Add to cart';

            thumbWrapper.appendChild(img);
            thumbWrapper.appendChild(buyOverlay);

            // Produkttitel
            const title = document.createElement('h3');
            title.textContent = product.name;
            title.className = 'product-title';

            // Preis
            const price = document.createElement('p');
            price.textContent = `${product.price} €`;
            price.className = 'product-price';

            // Kategorie-Tag
            const cat = categoryMap[product.category_id];

            if (!cat) {
                console.warn(`Kategorie mit ID ${product.category_id} nicht in categoryMap gefunden`);
            }

            const categoryTag = document.createElement('span');
            categoryTag.className = 'tag category-tag';
            categoryTag.textContent = cat
                ? cat.parentName
                    ? `${cat.parentName} / ${cat.name}`
                    : cat.name
                : 'Unbekannt';

            // Bewertung
            const ratingWrapper = document.createElement('div');
            ratingWrapper.className = 'product-rating';

            const ratingValue = parseFloat(product.average_rating || 0);
            const reviewCount = parseInt(product.review_count || 0);

            // Sterne
            const starsSpan = document.createElement('span');
            starsSpan.className = 'stars';
            starsSpan.textContent = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));

            // Bewertung (z. B. 3.3)
            const ratingNumber = document.createElement('span');
            ratingNumber.className = 'rating-value';
            ratingNumber.textContent = `(${ratingValue.toFixed(1)})`;

            // Review-Zahl (z. B. 6 Bewertungen)
            const reviewCounthtml = document.createElement('span');
            reviewCounthtml.className = 'review-count';
            reviewCounthtml.textContent = `(${reviewCount} Bewertungen)`;

            ratingWrapper.appendChild(starsSpan);
            ratingWrapper.appendChild(ratingNumber);
            ratingWrapper.appendChild(reviewCounthtml);

            // Info-Wrapper
            const info = document.createElement('div');
            info.className = 'product-info';
            info.appendChild(title);
            info.appendChild(price);
            info.appendChild(categoryTag);
            info.appendChild(document.createElement('br'));
            info.appendChild(ratingWrapper);
            info.appendChild(productInfoOverlay);

            // Zusammenbauen
            link.appendChild(thumbWrapper);
            link.appendChild(info);
            li.appendChild(link);
            productList.appendChild(li);
        });

    } catch (error) {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }

}



let categoryMap = {};

async function loadCategoryMap() {
    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/categories`);

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const json = await res.json();

        if (!json.success || !Array.isArray(json.data)) {
            throw new Error('Ungültige Struktur');
        }

        const flatMap = {};
        json.data.forEach(parent => {
            flatMap[parent.id] = { name: parent.name, parentName: null };
            if (Array.isArray(parent.children)) {
                parent.children.forEach(child => {
                    flatMap[child.id] = { name: child.name, parentName: parent.name };
                });
            }
        });

        categoryMap = flatMap;
    } catch (err) {
        console.error('Kategorie-Map konnte nicht geladen werden:', err);
    }
}

const fetchOptionsWithCredentials = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' }
};

