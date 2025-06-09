async function loadUserInfo() {
    try {
        const res = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
            const user = json.data;
            document.getElementById('user-info').innerText = `Hallo ${user.first_name} (${user.role})`;
            document.getElementById('admin-link').style.display = user.role === 'Admin' ? 'inline' : 'none';
        } else {
            document.getElementById('user-info').innerText = 'Nicht eingeloggt';
            document.getElementById('admin-link').style.display = 'none';
        }
    } catch {
        document.getElementById('user-info').innerText = 'Nicht eingeloggt';
        document.getElementById('admin-link').style.display = 'none';
    }
}

async function loadProducts() {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '<li>Produkte werden geladen...</li>';

    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error('Fehler beim Abrufen der Produkte');
        const result = await response.json();
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
            a.href = `/product/${product.id}`;
            li.appendChild(a);
            productList.appendChild(li);
        });
    } catch (error) {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }
}

window.onload = async () => {
    // await loadUserInfo();
    // Optional: Home-HTML laden, falls benötigt
    // const response = await fetch("/html/home.html");
    // const html = await response.text();
    // document.getElementById('app').innerHTML = html;
    await loadProducts();
};