import { router } from '../utils/router';

window.addEventListener('DOMContentLoaded', () => {
    router();
    window.onpopstate = router;
});

function loadPartial(id, file) {
    fetch(file)
        .then(res => res.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}