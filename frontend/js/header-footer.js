const burger = document.querySelector('.burger i');
const nav = document.querySelector('.nav');

function toggleNav() {
    burger.classList.toggle('fa-bars');
    burger.classList.toggle('fa-times');
    nav.classList.toggle('nav-active');
}

/*burger.addEventListener('click', function() {
    toggleNav();
});*/

document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById('selector');
    if (!select) return; // make sure element exists

    const selected = select.querySelector('.selected');
    const optionsContainer = select.querySelector('.options');
    const options = select.querySelectorAll('.option');

    selected.addEventListener('click', () => {
        optionsContainer.style.display =
            optionsContainer.style.display === 'flex' ? 'none' : 'flex';
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.innerHTML = option.innerHTML;
            optionsContainer.style.display = 'none';
            console.log("Selected:", option.dataset.value);
        });
    });

    document.addEventListener('click', (e) => {
        if (!select.contains(e.target)) {
            optionsContainer.style.display = 'none';
        }
    });
});