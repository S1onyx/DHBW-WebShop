(async function loadProduct() {
    const id = getProductIdFromPath();
    if (!id) return;

    const title = document.getElementById('product-title');
    const seller = document.getElementById('product-seller');
    const description = document.getElementById('product-description');
    const price = document.getElementById('product-price');
    const stock = document.getElementById('product-stock');
    const imageContainer = document.getElementById('product-images');
    const reviewList = document.getElementById('review-list');

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
        seller.textContent = product.seller_name ? `Verkäufer: ${product.seller_name}` : '';
        description.textContent = product.description;
        price.textContent = `Preis: ${product.price} €`;
        stock.textContent = `Auf Lager: ${product.stock}`;

// Bilder anzeigen
imageContainer.innerHTML = '';
if (Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach(img => {
        const image = document.createElement('img');
        const imageUrl = img.url;
        image.src = imageUrl.startsWith('http')
            ? imageUrl
            : `http://${window.ROOT_URL}:3000${imageUrl}`;
        image.alt = product.name;
        image.classList.add('product-image');
        imageContainer.appendChild(image);
    });
} else if (product.image_url) {
    const imageUrl = product.image_url;
    const img = document.createElement('img');
    img.src = imageUrl.startsWith('http')
        ? imageUrl
        : `http://${window.ROOT_URL}:3000${imageUrl}`;
    img.alt = product.name;
    img.classList.add('product-image');
    imageContainer.appendChild(img);
}

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
})();