export async function renderProductPage(id) {
    const response = await fetch("../html/product_page.html");
    const html = await response.text();
    document.getElementById("app").innerHTML = html;

    try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Produkt konnte nicht geladen werden");

        const result = await res.json();
        const product = result.data; // <- Anpassung hier

        document.getElementById("product-title").textContent = product.name || "Kein Name";
        document.getElementById("product-seller").textContent = `Verkäufer: ${product.seller_name || "Unbekannt"}`;
        document.getElementById("product-description").textContent = product.description || "";
        document.getElementById("product-price").textContent = `Preis: ${product.price || "?"} €`;
        document.getElementById("product-stock").textContent = `Auf Lager: ${product.stock ?? "?"}`;

        // Bilder anzeigen (Fallback auf image_url)
        const imageContainer = document.getElementById("product-images");
        imageContainer.innerHTML = "";
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            product.images.forEach(img => {
                const image = document.createElement("img");
                image.src = img.url;
                image.alt = product.name;
                image.classList.add("product-image");
                imageContainer.appendChild(image);
            });
        } else if (product.image_url) {
            const image = document.createElement("img");
            image.src = product.image_url;
            image.alt = product.name;
            image.classList.add("product-image");
            imageContainer.appendChild(image);
        }

        // Bewertungen anzeigen (wenn vorhanden)
        const reviewList = document.getElementById("review-list");
        reviewList.innerHTML = "";
        if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
            product.reviews.forEach(review => {
                const li = document.createElement("li");
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
        document.getElementById("app").innerHTML = `
            <p style="color:red;">Fehler: ${error.message}</p>
        `;
    }
}
window.onload = async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        await renderProductPage(id);
    } else {
        document.getElementById("app").innerHTML = "<p style='color:red;'>Keine Produkt-ID angegeben.</p>";
    }
}