export async function renderProductPage(id) {
    const response = await fetch("../html/product_page.html");
    const html = await response.text();
    document.getElementById("app").innerHTML = html;

    try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Produkt konnte nicht geladen werden");

        const product = await res.json();

        document.getElementById("product-title").textContent = product.name;
        document.getElementById("product-seller").textContent = `Verkäufer: ${product.seller_name}`;
        document.getElementById("product-description").textContent = product.description;
        document.getElementById("product-price").textContent = `Preis: ${product.price} €`;
        document.getElementById("product-stock").textContent = `Auf Lager: ${product.stock}`;

        // Bilder anzeigen
        const imageContainer = document.getElementById("product-images");
        imageContainer.innerHTML = ""; // sicherheitshalber leeren
        product.images.forEach(img => {
            const image = document.createElement("img");
            image.src = img.url;
            image.alt = product.name;
            image.classList.add("product-image");
            imageContainer.appendChild(image);
        });

        // Bewertungen anzeigen
        const reviewList = document.getElementById("review-list");
        reviewList.innerHTML = ""; // leeren
        product.reviews.forEach(review => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${review.name}</strong> – ⭐ ${review.rating}<br>
                <em>${review.comment}</em>
            `;
            reviewList.appendChild(li);
        });

    } catch (error) {
        document.getElementById("app").innerHTML = `
            <p style="color:red;">Fehler: ${error.message}</p>
        `;
    }
}
