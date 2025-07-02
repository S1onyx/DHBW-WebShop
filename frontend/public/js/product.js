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

// Amount
lessBtn.addEventListener('click', () => {
    let currentAmount = parseInt(amountInput.value) || 1;
    if(currentAmount > 1) {
        amountInput.value = currentAmount - 1;
    } else {
        amountInput.value = maxAmount;
    }
});

moreBtn.addEventListener('click', () => {
    let currentAmount = parseInt(amountInput.value) || 1;
    if(currentAmount < maxAmount) {
        amountInput.value = currentAmount + 1;
    } else {
        amountInput.value = 1;
    }
});

amountInput.addEventListener('input', () => {
    let currentAmount = parseInt(amountInput.value);
    if(currentAmount < 1) {
        amountInput.value = 1;
    } else if(currentAmount > maxAmount) {
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

        // Bewertungen anzeigen
        renderReviews(product.reviews);

    } catch (error) {
        title.textContent = `Fehler : ${error.message}`;
    }

    function getProductIdFromPath() {
        const match = window.location.pathname.match(/\/product\/(\d+)/);
        return match ? match[1] : null;
    }
}

function loadAmount(product){
    maxAmount = product.stock;
    if(maxAmount == 0) {
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

function renderReviews(reviews) {
    reviewList.innerHTML = '';

    if (Array.isArray(reviews) && reviews.length > 0) {
        reviews.forEach(review => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${review.name}</strong> – ⭐ ${review.rating}<br>
                <em>${review.comment}</em>
            `;
            reviewList.appendChild(li);
        });
    } else {
        reviewList.innerHTML = "<li>No reviews yet.</li>";
    }
}
