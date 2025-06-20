(async () => {
    const loginDiv = document.querySelector('.login');
    const navbarLinks = document.querySelectorAll('.navbar [class$="-link"]');

    try {
        const res = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
        const json = await res.json();
        if (json.success) {
            if (loginDiv) loginDiv.style.display = 'none';
            navbarLinks.forEach(link => link.style.display = 'inline-block');
        } else {
            if (loginDiv) loginDiv.style.display = 'block';
            navbarLinks.forEach(link => link.style.display = 'none');
        }
    } catch (e) {
        if (loginDiv) loginDiv.style.display = 'block';
        navbarLinks.forEach(link => link.style.display = 'none');
    }
})();