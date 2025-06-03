(async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<li>Produkte werden geladen...</li>';

    try {
        const res = await fetch('http://localhost:3000/api/products');
        if (!res.ok) throw new Error('Fehler beim Abrufen der Produkte');

        const result = await res.json();
        const products = result.data;

        if (!Array.isArray(products) || products.length === 0) {
            productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
            return;
        }

        productList.innerHTML = '';
        products.forEach(product => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = `${product.name} – ${product.price} €`;
            a.href = `product/${product.id}`;
            if (product.image_url) {
                const img = document.createElement('img');
                img.src = product.image_url;
                img.alt = product.name;
                img.width = 64;
                img.height = 64;
                li.appendChild(img);
            }
            li.appendChild(a);
            productList.appendChild(li);
        });
    } catch (error) {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }
})();