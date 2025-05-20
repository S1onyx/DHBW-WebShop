import { renderHome } from '../js/home.js';
import { renderProductPage } from '../js/product_page.js';
// import { renderLogin } from '../js/login.js';
// import { renderDashboard } from '../js/dashboard.js';
// import { isLoggedIn } from './auth.js';

export function router() {
    const url = new URL(window.location.href);
    const path = url.pathname;
    const id = url.searchParams.get("id");

    const app = document.getElementById('app');
    app.innerHTML = ''; // Clear previous content

    switch (path) {
        case '/':
            renderHome();
            break;
        case '/product.html':
            if (id) {
                renderProductPage(id);
            } else {
                document.getElementById('app').innerHTML = '<p>Kein Produkt ausgewählt.</p>';
            }
            break;

        // Weitere Fälle (Login, Dashboard etc.)
        /*
        case '/login':
            renderLogin();
            break;
        case '/dashboard':
            if (isLoggedIn()) {
                renderDashboard();
            } else {
                renderLogin();
            }
            break;
        */

        default:
            app.innerHTML = '<h1>404 – Seite nicht gefunden</h1>';
    }
}
