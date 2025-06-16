window.currentSearchOptions = {};

let activeCategoryIds = [];
let currentPage = 1;
const productsPerPage = 16;
let allFilteredProducts = [];

async function loadProducts(categoryIds = [], page = 1, options = {}) {
    const productList = document.getElementById('product-list');
    if (!productList) return;
    productList.innerHTML = '<li>Produkte werden geladen...</li>';

    // Query-Parameter aufbauen
    const params = new URLSearchParams();
    if (categoryIds.length > 0) params.append('category', categoryIds.join(','));
    if (options.name) params.append('name', options.name);
    if (options.minPrice) params.append('minPrice', options.minPrice);
    if (options.maxPrice) params.append('maxPrice', options.maxPrice);
    if (options.inStock !== undefined) params.append('inStock', options.inStock);
    if (options.sort) params.append('sort', options.sort);
    if (options.order) params.append('order', options.order);

    try {
        const response = await fetch(`http://localhost:3000/api/products?${params.toString()}`);
        if (!response.ok) throw new Error('Fehler beim Abrufen der Produkte');
        const result = await response.json();
        let products = result.data;

        allFilteredProducts = products;

        // Paginierung im Frontend
        const start = (page - 1) * productsPerPage;
        const end = start + productsPerPage;
        const paginatedProducts = products.slice(start, end);

        if (!Array.isArray(paginatedProducts) || paginatedProducts.length === 0) {
            productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
            renderPagination(products.length, page);
            return;
        }

        productList.innerHTML = '';
        paginatedProducts.forEach(product => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.textContent = `${product.name} – ${product.price} €`;
            a.href = `/product/${product.id}`;
            li.appendChild(a);
            productList.appendChild(li);
        });

        renderPagination(products.length, page);
    } catch (error) {
        productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }
}

const searchInput = document.getElementById('search-input');

function triggerSearch() {
    const name = searchInput.value.trim();
    window.currentSearchOptions = { name };
    currentPage = 1;
    loadProducts(activeCategoryIds, currentPage, window.currentSearchOptions);
}

// Paginierung in renderPagination anpassen:
function renderPagination(totalProducts, currentPage) {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(totalProducts / productsPerPage);
    document.getElementById('page-number').textContent = totalProducts === 0 ? 0 : currentPage;
    document.getElementById('max-pages').textContent = totalPages;

    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn && nextBtn) {
        prevBtn.style.cursor = currentPage > 1 ? 'pointer' : 'not-allowed';
        nextBtn.style.cursor = currentPage < totalPages ? 'pointer' : 'not-allowed';

        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                loadProducts(activeCategoryIds, currentPage, window.currentSearchOptions);
            }
        };
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadProducts(activeCategoryIds, currentPage, window.currentSearchOptions);
            }
        };
    }
}

function renderActiveFilterTags(categories) {
    const activeFiltersDiv = document.querySelector('.active-filters');
    activeFiltersDiv.innerHTML = '';
    categories.forEach(({ id, name }) => {
        const tag = document.createElement('div');
        tag.textContent = name;
        tag.className = 'active-filter-tag';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.className = 'close-btn';

        closeBtn.onclick = () => {
            activeCategoryIds = activeCategoryIds.filter(cid => cid !== id);
            renderActiveFilterTags(getActiveCategoryNames());
            currentPage = 1; // Seite zurücksetzen
            loadProducts(activeCategoryIds, currentPage);
            // Setze das zugehörige Select zurück
            document.querySelectorAll('.filters-selector').forEach(sel => {
                if ([...sel.options].some(opt => Number(opt.value) === id)) {
                    sel.selectedIndex = 0;
                }
            });
        };

        tag.appendChild(closeBtn);
        activeFiltersDiv.appendChild(tag);
    });
}

// Hilfsfunktion, um Namen der aktiven Kategorien zu bekommen
function getActiveCategoryNames() {
    return window.allCategoriesFlat
        .filter(cat => activeCategoryIds.includes(cat.id))
        .map(cat => ({ id: cat.id, name: cat.name }));
}

async function loadAndRenderCategoryFilters() {
    const filtersWrapper = document.querySelector('.filters');
    if (!filtersWrapper) return;

    const res = await fetch('http://localhost:3000/api/categories');
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return;

    filtersWrapper.innerHTML = '';

    // Flache Liste aller Kategorien und Unterkategorien für Namensauflösung
    window.allCategoriesFlat = [];
    function flattenCategories(list) {
        list.forEach(cat => {
            window.allCategoriesFlat.push({ id: cat.id, name: cat.name });
            if (cat.children?.length) flattenCategories(cat.children);
        });
    }
    flattenCategories(json.data);

    json.data.forEach(category => {
        const select = document.createElement('select');
        select.name = category.name;
        select.id = category.name.replace(/\s+/g, '');
        select.className = 'filters-selector';

// ... im loadAndRenderCategoryFilters()
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = category.name;
        emptyOption.disabled = true;
        emptyOption.selected = true;
        emptyOption.hidden = true;
        select.appendChild(emptyOption);

// Dann wie gehabt:
        const mainOption = document.createElement('option');
        mainOption.value = category.id;
        mainOption.textContent = category.name;
        mainOption.className = 'filters-select';
        select.appendChild(mainOption);

        category.children.forEach(child => {
            const option = document.createElement('option');
            option.value = child.id;
            option.textContent = child.name;
            option.className = 'filters-select';
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const selectedOption = e.target.options[e.target.selectedIndex];
            const value = e.target.value;
            if (value) {
                const id = Number(value);
                if (!activeCategoryIds.includes(id)) {
                    activeCategoryIds.push(id);
                }
                renderActiveFilterTags(getActiveCategoryNames());
                currentPage = 1; // Seite zurücksetzen
                loadProducts(activeCategoryIds, currentPage);
            }
            // Auswahl bleibt gesetzt, bis X gedrückt wird
        });

        filtersWrapper.appendChild(select);
    });
}

window.onload = async () => {
    await loadAndRenderCategoryFilters();
    await loadProducts();


    const searchInput = document.getElementById('search-input');
    const searchIcon = document.querySelector('.search-icon');

    function triggerSearch() {
        if (!searchInput) return;
        const name = searchInput.value.trim();
        window.currentSearchOptions = { name };
        currentPage = 1;
        loadProducts(activeCategoryIds, currentPage, window.currentSearchOptions);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                triggerSearch();
            }
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', triggerSearch);
    }
};
