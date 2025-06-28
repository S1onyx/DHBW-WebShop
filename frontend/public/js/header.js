(async () => {
    const loginDiv = document.querySelector('.login');
    const navbar = document.querySelector('.navbar');
    const wishlistLink = navbar.querySelector('.wishlist-link');
    const cartLink = navbar.querySelector('.cart-link');
    const adminLink = navbar.querySelector('.admin-link');
    const navbarLinks = navbar.querySelectorAll('[class$="-link"]:not(.admin-link)');

    try {
        const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
            if (loginDiv) loginDiv.style.display = 'none';
            // Admin-Check
            if (json.data && json.data.role_id === 1) {
                navbarLinks.forEach(link => {
                    if (link !== wishlistLink && link !== cartLink) {
                        link.style.display = 'inline-block';
                    } else {
                        link.style.display = 'none';
                    }
                });
                if (adminLink) adminLink.style.display = 'inline-block';
            } else {
                navbarLinks.forEach(link => link.style.display = 'inline-block');
                if (adminLink) adminLink.style.display = 'none';
            }
        } else {
            if (loginDiv) loginDiv.style.display = 'block';
            navbarLinks.forEach(link => link.style.display = 'none');
            if (adminLink) adminLink.style.display = 'none';
        }
    } catch (e) {
        if (loginDiv) loginDiv.style.display = 'block';
        navbarLinks.forEach(link => link.style.display = 'none');
        if (adminLink) adminLink.style.display = 'none';
    }
})();