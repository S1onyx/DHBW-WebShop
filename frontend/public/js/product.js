const title = document.getElementById('title');
const seller = document.getElementById('seller');
const description = document.getElementById('product-description');
const price = document.getElementById('price');
const productImage = document.getElementById('product-image');
const reviewList = document.getElementById('review-list');

const prevPictureButton = document.getElementById('picture-left');
const nextPictureButton = document.getElementById('picture-right');

let imageUrls;
let currentImageIndex = 0;

window.onload = () => loadProduct();

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

        title.textContent = product.name;
        seller.textContent = product.seller_name ? `Seller: ${product.seller_name}` : '';
        description.textContent = product.description;
        price.textContent = `${product.price} €`;

        // Show Picture
        imageUrls = product.images?.map(img => {
            const url = img.url;
            return url.startsWith('http')
                ? url
                : `http://${window.ROOT_URL}:3000${url}`;
        }) ?? (
                product.image_url
                    ? [
                        product.image_url.startsWith('http')
                            ? product.image_url
                            : `http://${window.ROOT_URL}:3000${product.image_url}`
                    ]
                    : []
            );

        showImage(currentImageIndex);


        // Bewertungen
        reviewList.innerHTML = '';
        if (Array.isArray(product.reviews) && product.reviews.length > 0) {
            product.reviews.forEach(review => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${review.name}</strong> – ⭐ ${review.rating}<br>
                    <em>${review.comment}</em>
                `;
                reviewList.appendChild(li);
            });
        } else {
            reviewList.innerHTML = "<li>Keine Bewertungen vorhanden.</li>";
        }
    } catch (error) {
        title.textContent = `Fehler : ${error.message}`;
    }

    function getProductIdFromPath() {
        const match = window.location.pathname.match(/\/product\/(\d+)/);
        return match ? match[1] : null;
    }
};