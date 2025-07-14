(async () => {
    const loginDiv = document.querySelector('.nav .login');
    const navbar = document.querySelector('.nav');
    const wishlistLink = navbar.querySelector('.wishlist-link');
    const cartLink = navbar.querySelector('.cart-link');
    const adminLink = navbar.querySelector('.admin-link');
    const sellerLink = navbar.querySelector('.seller-link');
    const navbarLinks = navbar.querySelectorAll('[class$="navlink"]:not(.admin-link)');

    console.log(navbarLinks, navbar);
    console.log(document.querySelectorAll('[class$="navlink"]'));
    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, { credentials: 'include' });
        const json = await res.json();
        if (json.success && json.data) {
            loginDiv.style.display = 'none';
            const role = json.data.role_id;

            // Default: hide everything
            navbarLinks.forEach(link => link.style.display = 'none');
            if (adminLink) adminLink.style.display = 'none';
            if (sellerLink) sellerLink.style.display = 'none';

            if (role === 1) { // Admin
                navbarLinks.forEach(link => {
                    if (link !== wishlistLink && link !== cartLink) {
                        link.style.display = 'inline-block';
                    }
                });
                adminLink.style.display = 'inline-block';

            } else if (role === 2) { // Seller
                navbarLinks.forEach(link => {
                    if (link !== wishlistLink && link !== cartLink) {
                        link.style.display = 'inline-block';
                    }
                });
                sellerLink.style.display = 'inline-block';

            } else { // Regular user
                navbarLinks.forEach(link => link.style.display = 'inline-block');
            }
        } else {
            loginDiv.style.display = 'block';
            navbarLinks.forEach(link => link.style.display = 'none');
            if (adminLink) adminLink.style.display = 'none';
            if (sellerLink) sellerLink.style.display = 'none';
        }
    } catch (e) {
        if (loginDiv) loginDiv.style.display = 'block';
        navbarLinks.forEach(link => link.style.display = 'none');
        if (adminLink) adminLink.style.display = 'none';
    }

    const burgerMenu = document.getElementById('burger-menu');
    const nav = document.querySelector('.nav');

    burgerMenu.addEventListener("click", function () {
        burgerMenu.classList.toggle('active');
        nav.classList.toggle('nav-active'); // Optional: show/hide menu
    });
})();
