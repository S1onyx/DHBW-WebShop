export async function renderHome() {
    const response = await fetch("/html/home.html");
    const html = await response.text();
    document.getElementById('app').innerHTML = html;

    const productList = document.getElementById('product-list');
    if (!productList) return;

    productList.innerHTML = '<li>Produkte werden geladen...</li>';

    try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Fehler beim Abrufen der Produkte');

        const products = await res.json();

        if (products.length === 0) {
            productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
        } else {
            productList.innerHTML = '';
            products.forEach(product => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.textContent = `${product.product_name} – ${product.price} €`;
                a.href = `product.html?id=${product.id}`;
                li.appendChild(a);
                productList.appendChild(li);
            });
        }
    } catch (error) {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }
}
