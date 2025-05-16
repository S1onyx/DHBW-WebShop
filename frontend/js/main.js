
document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '<li>Produkte werden geladen...</li>';
  
    fetch('/api/products')
      .then(response => {
        if (!response.ok) throw new Error('Fehler beim Abrufen der Produkte');
        return response.json();
      })
      .then(products => {
        if (products.length === 0) {
          productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
        } else {
          productList.innerHTML = ''; // leeren
          products.forEach(product => {
              const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = `${product.product_name} – ${product.price} € (Auf Lager: ${product.stock})`;
            a.href = `product.html?id=${product.id}`;
            li.appendChild(a);
            productList.appendChild(li);
          });
        }
      })
      .catch(error => {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
      });
});

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
});