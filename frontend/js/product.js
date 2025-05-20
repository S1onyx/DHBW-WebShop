function getProductIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

function loadPartial(id, file) {
    fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}

document.addEventListener("DOMContentLoaded", () => {
    loadPartial("header", "header.html");
    loadPartial("footer", "footer.html");

    const id = getProductIdFromUrl();
    if (!id) return;

    fetch(`/api/products/${id}`)
        .then(response => {
            if (!response.ok) throw new Error("Produkt konnte nicht geladen werden");
            return response.json();
        })
        .then(product => {
            document.getElementById("product-title").textContent = product.name;
            document.getElementById("product-seller").textContent = `Verkäufer: ${product.seller_name}`;
            document.getElementById("product-description").textContent = product.description;
            document.getElementById("product-price").textContent = `Preis: ${product.price} €`;
            document.getElementById("product-stock").textContent = `Auf Lager: ${product.stock}`;

            // Bilder
            const imageContainer = document.getElementById("product-images");
            product.images.forEach(img => {
                const image = document.createElement("img");
                image.src = img.url;
                image.alt = product.name;
                image.classList.add("product-image");
                imageContainer.appendChild(image);
            });

            // Bewertungen
            const reviewList = document.getElementById("review-list");
            product.reviews.forEach(review => {
                const li = document.createElement("li");
                li.innerHTML = `
          <strong>${review.name}</strong> – ⭐ ${review.rating}<br>
          <em>${review.comment}</em>
        `;
                reviewList.appendChild(li);
            });
        })
        .catch(error => {
            document.querySelector("main").innerHTML = `<p style="color:red;">Fehler: ${error.message}</p>`;
        });
});
