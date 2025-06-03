// frontend/public/js/product.js
(async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    // Elemente aus dem HTML holen
    const title = document.getElementById('product-title');
    const seller = document.getElementById('product-seller');
    const description = document.getElementById('product-description');
    const price = document.getElementById('product-price');
    const stock = document.getElementById('product-stock');
    const imageContainer = document.getElementById('product-images');
    const reviewList = document.getElementById('review-list');

    // Ladeanzeige
    title.textContent = 'Produkt wird geladen...';

    try {
        const res = await fetch(`http://localhost:3000/api/product?id=${id}`);
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

        // Bild anzeigen
        imageContainer.innerHTML = '';
        if (product.image_url) {
            const img = document.createElement('img');
            img.src = product.image_url;
            img.alt = product.name;
            img.classList.add('product-image');
            imageContainer.appendChild(img);
        }

        // Bewertungen (wenn vorhanden)
        reviewList.innerHTML = '';
        if (Array.isArray(product.reviews)) {
            product.reviews.forEach(review => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${review.name}</strong> – ⭐ ${review.rating}<br>
                    <em>${review.comment}</em>
                `;
                reviewList.appendChild(li);
            });
        }
    } catch (error) {
        title.textContent = `Fehler: ${error.message}`;
    }
})();