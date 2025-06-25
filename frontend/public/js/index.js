let categoryMap = {};

async function loadCategoryMap() {
  try {
    const res = await fetch(`http://${window.ROOT_URL}:3000/api/categories`);

    if (!res.ok) throw new Error(`Status ${res.status}`);

    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Ungültige Struktur');
    }

    const flatMap = {};
    json.data.forEach(parent => {
      flatMap[parent.id] = { name: parent.name, parentName: null };
      if (Array.isArray(parent.children)) {
        parent.children.forEach(child => {
          flatMap[child.id] = { name: child.name, parentName: parent.name };
        });
      }
    });

    categoryMap = flatMap;
  } catch (err) {
    console.error('Kategorie-Map konnte nicht geladen werden:', err);
  }
}

let selectedCategoryId = null;
let selectedCategoryName = '';
let currentPage = 1;
let productsPerPage = 16;

window.currentSearchOptions = {
  inStock: false,
  minPrice: undefined,
  maxPrice: undefined,
  name: '',
  sort: undefined,
  order: undefined
};

function updateActiveFiltersUI() {
  const container = document.querySelector('.active-filters');
  if (!container) return;
  container.innerHTML = '';

  const tags = [];

  if (selectedCategoryId && selectedCategoryName) {
    tags.push({ label: selectedCategoryName, type: 'category' });
  }

  if (window.currentSearchOptions.name) {
    tags.push({ label: `Name: ${window.currentSearchOptions.name}`, type: 'name' });
  }

  if (window.currentSearchOptions.inStock) {
    tags.push({ label: `Nur verfügbare Produkte`, type: 'inStock' });
  }

  if (
    typeof window.currentSearchOptions.minPrice === 'number' &&
    typeof window.currentSearchOptions.maxPrice === 'number'
  ) {
    tags.push({
      label: `Preis: ${window.currentSearchOptions.minPrice}–${window.currentSearchOptions.maxPrice} €`,
      type: 'price'
    });
  }

  if (window.currentSearchOptions.sort) {
    const label = {
      price: 'Preis',
      name: 'Name',
      rating: 'Bewertung'
    }[window.currentSearchOptions.sort];
    tags.push({ label: `Sortiert nach: ${label}`, type: 'sort' });
  }

  tags.forEach(tag => {
    const div = document.createElement('div');
    div.className = 'filter-tag';
    div.textContent = tag.label;

    const remove = document.createElement('span');
    remove.textContent = '×';
    remove.className = 'remove-tag';
    remove.onclick = () => {
      if (tag.type === 'category') {
        selectedCategoryId = null;
        selectedCategoryName = '';
      }
      if (tag.type === 'name') window.currentSearchOptions.name = '';
      if (tag.type === 'inStock') window.currentSearchOptions.inStock = false;
      if (tag.type === 'price') {
        window.currentSearchOptions.minPrice = undefined;
        window.currentSearchOptions.maxPrice = undefined;
        document.getElementById('min-price').value = 0;
        document.getElementById('max-price').value = 1000;
      }
      if (tag.type === 'sort') {
        window.currentSearchOptions.sort = undefined;
        window.currentSearchOptions.order = undefined;
        document.getElementById('sort-select').selectedIndex = 0;
      }

      document.querySelector('select.filters-selector').selectedIndex = 0;
      document.getElementById('inStock').checked = false;
      document.getElementById('search-input').value = '';
      loadProducts(selectedCategoryId, 1, window.currentSearchOptions);
    };

    div.appendChild(remove);
    container.appendChild(div);
  });
}

const fetchOptionsWithCredentials = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
};

async function getCurrentUser() {
  const res = await fetch(`http://${window.ROOT_URL}:3000/api/users/me`, fetchOptionsWithCredentials);
  const json = await res.json();
  return json;
}

async function loadProducts(categoryId = null, page = 1, options = {}) {
  const productList = document.getElementById('product-list');
  if (!productList) return;
  productList.innerHTML = '<li>Produkte werden geladen...</li>';

  const params = new URLSearchParams();
  if (categoryId) params.append('category', categoryId);
  if (options.name) params.append('name', options.name);
  if (typeof options.minPrice === 'number') params.append('minPrice', options.minPrice);
  if (typeof options.maxPrice === 'number') params.append('maxPrice', options.maxPrice);
  if (options.inStock === true) params.append('inStock', true);
  if (options.sort) params.append('sort', options.sort);
  if (options.order) params.append('order', options.order);

  params.append('limit', productsPerPage);
  params.append('offset', (page - 1) * productsPerPage);

  try {
    const response = await fetch(`http://${window.ROOT_URL}:3000/api/products?${params.toString()}`);
    if (!response.ok) throw new Error('Fehler beim Abrufen der Produkte');
    const result = await response.json();
    const products = result.data || [];
    const total = result.total || products.length;

    if (products.length === 0) {
      productList.innerHTML = '<li>Keine Produkte verfügbar.</li>';
      renderPagination(total, page);
      updateActiveFiltersUI();
      return;
    }

productList.innerHTML = '';

products.forEach(product => {
  const li = document.createElement('li');
  li.className = 'product-card';

  const productInfoOverlay = document.createElement('div');
    productInfoOverlay.className = 'product-info-overlay';
    productInfoOverlay.textContent = 'Product Page';

  const link = document.createElement('a');
  link.href = `/product/${product.id}`;
  link.className = 'product-link';

// Produktbild
  const thumbWrapper = document.createElement('div');
  thumbWrapper.className = 'product-thumb-wrapper';

  const img = document.createElement('img');
  const imageUrl = product.image_url;
  img.src = imageUrl
      ? imageUrl.startsWith('http')
          ? imageUrl
          : `http://${window.ROOT_URL}:3000${imageUrl}`
      : '/images/placeholder.jpg';
  img.alt = product.name;
  img.className = 'product-thumb small-thumb';
  img.dataset.id = product.id;

// Klick-Event für das Bild
  img.addEventListener('click', async function(event) {
    event.preventDefault();
    const body = { productId: product.id, quantity: 1 };
    console.log('Sende an API:', body);
    await fetch(`http://${window.ROOT_URL}:3000/api/carts/items`, {
      ...fetchOptionsWithCredentials,
      method: 'POST',
      body: JSON.stringify(body)
    });
  });

  const buyOverlay = document.createElement('div');
  buyOverlay.className = 'buy-overlay';
  buyOverlay.textContent = 'Buy';

  thumbWrapper.appendChild(img);
  thumbWrapper.appendChild(buyOverlay);

  // Produkttitel
  const title = document.createElement('h3');
  title.textContent = product.name;
  title.className = 'product-title';

  // Preis
  const price = document.createElement('p');
  price.textContent = `${product.price} €`;
  price.className = 'product-price';

// Kategorie-Tag
const cat = categoryMap[product.category_id];

if (!cat) {
  console.warn(`Kategorie mit ID ${product.category_id} nicht in categoryMap gefunden`);
}

const categoryTag = document.createElement('span');
categoryTag.className = 'tag category-tag';
categoryTag.textContent = cat
  ? cat.parentName
    ? `${cat.parentName} / ${cat.name}`
    : cat.name
  : 'Unbekannt';

// Bewertung
const ratingWrapper = document.createElement('div');
ratingWrapper.className = 'product-rating';

const ratingValue = parseFloat(product.average_rating || 0);
const reviewCount = parseInt(product.review_count || 0);

// Sterne
const starsSpan = document.createElement('span');
starsSpan.className = 'stars';
starsSpan.textContent = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));

// Bewertung (z. B. 3.3)
const ratingNumber = document.createElement('span');
ratingNumber.className = 'rating-value';
ratingNumber.textContent = `(${ratingValue.toFixed(1)})`;

// Review-Zahl (z. B. 6 Bewertungen)
const reviewCounthtml = document.createElement('span');
reviewCounthtml.className = 'review-count';
reviewCounthtml.textContent = `(${reviewCount} Bewertungen)`;

ratingWrapper.appendChild(starsSpan);
ratingWrapper.appendChild(ratingNumber);
ratingWrapper.appendChild(reviewCounthtml);

  // Info-Wrapper
  const info = document.createElement('div');
  info.className = 'product-info';
  info.appendChild(title);
  info.appendChild(price);
  info.appendChild(categoryTag);
  info.appendChild(document.createElement('br'));
  info.appendChild(ratingWrapper);
  info.appendChild(productInfoOverlay);

  // Zusammenbauen
  link.appendChild(thumbWrapper);
  link.appendChild(info);
  li.appendChild(link);
  productList.appendChild(li);
});

    currentPage = page;
    renderPagination(total, page);
    updateActiveFiltersUI();
  } catch (error) {
    productList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    updateActiveFiltersUI();
  }
}

function renderPagination(totalProducts, currentPage) {
  const paginationDiv = document.getElementById('pagination');
  const pageNumber = document.getElementById('page-number');
  const maxPages = document.getElementById('max-pages');
  const prevPage = document.getElementById('prev-page');
  const nextPage = document.getElementById('next-page');

  if (!paginationDiv || !pageNumber || !maxPages || !prevPage || !nextPage) return;

  const totalPages = Math.ceil(totalProducts / productsPerPage);
  maxPages.textContent = totalPages;
  pageNumber.textContent = currentPage;

  // Pfeile aktiv/deaktiv
  prevPage.style.opacity = currentPage === 1 ? '0.3' : '1';
  prevPage.style.pointerEvents = currentPage === 1 ? 'none' : 'auto';
  nextPage.style.opacity = currentPage === totalPages ? '0.3' : '1';
  nextPage.style.pointerEvents = currentPage === totalPages ? 'none' : 'auto';

  prevPage.onclick = () => {
    if (currentPage > 1) {
      loadProducts(selectedCategoryId, currentPage - 1, window.currentSearchOptions);
    }
  };

  nextPage.onclick = () => {
    if (currentPage < totalPages) {
      loadProducts(selectedCategoryId, currentPage + 1, window.currentSearchOptions);
    }
  };

  const visible = new Set();

  // immer zeigen
  visible.add(1);
  visible.add(2);
  visible.add(totalPages - 1);
  visible.add(totalPages);

}

async function loadAndRenderCategoryFilter() {
  const filtersWrapper = document.querySelector('.filters');
  if (!filtersWrapper) return;

  const res = await fetch(`http://${window.ROOT_URL}:3000/api/categories`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) return;

  filtersWrapper.innerHTML = '';

  const select = document.createElement('select');
  select.className = 'filters-selector';
  select.innerHTML = `<option value="">Kategorie wählen</option>`;

  function appendOptions(categories, isChild = false) {
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = isChild ? `↳ ${category.name}` : category.name;
      if (!isChild) option.style.fontWeight = 'bold';
      select.appendChild(option);
      if (category.children) appendOptions(category.children, true);
    });
  }
  appendOptions(json.data);

  select.addEventListener('change', (e) => {
    selectedCategoryId = e.target.value || null;
    selectedCategoryName = e.target.options[e.target.selectedIndex]?.textContent || '';
    currentPage = 1;
    loadProducts(selectedCategoryId, currentPage, window.currentSearchOptions);
  });

  const inStockDiv = document.createElement('div');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = 'inStock';
  checkbox.style.marginLeft = '1rem';

  const checkboxLabel = document.createElement('label');
  checkboxLabel.htmlFor = 'inStock';
  checkboxLabel.textContent = 'Nur verfügbare Produkte';

  checkbox.addEventListener('change', () => {
    window.currentSearchOptions.inStock = checkbox.checked;
    loadProducts(selectedCategoryId, 1, window.currentSearchOptions);
  });

    inStockDiv.appendChild(checkbox);
    inStockDiv.appendChild(checkboxLabel);

  const priceWrapper = document.createElement('div');
  priceWrapper.className = 'price-range-wrapper';

  const rangeLabel = document.createElement('div');
  rangeLabel.className = 'price-values';
  rangeLabel.textContent = 'Preis: 0 € – 1000 €';

  const rangeMin = document.createElement('input');
  const rangeMax = document.createElement('input');

  rangeMin.type = rangeMax.type = 'range';
  rangeMin.min = rangeMax.min = 0;
  rangeMin.max = rangeMax.max = 1000;
  rangeMin.step = rangeMax.step = 5;
  rangeMin.value = 0;
  rangeMax.value = 1000;
  rangeMin.id = 'min-price';
  rangeMax.id = 'max-price';

  function updatePriceDisplay() {
    let min = parseInt(rangeMin.value);
    let max = parseInt(rangeMax.value);
    if (min > max) {
      if (this === rangeMin) {
        rangeMax.value = min;
        max = min;
      } else {
        rangeMin.value = max;
        min = max;
      }
    }
    rangeLabel.textContent = `Preis: ${min} € – ${max} €`;
    window.currentSearchOptions.minPrice = min;
    window.currentSearchOptions.maxPrice = max;
    loadProducts(selectedCategoryId, 1, window.currentSearchOptions);
  }

  rangeMin.addEventListener('input', updatePriceDisplay);
  rangeMax.addEventListener('input', updatePriceDisplay);

  priceWrapper.appendChild(rangeLabel);
  priceWrapper.appendChild(rangeMin);
  priceWrapper.appendChild(rangeMax);

  const sortSelect = document.createElement('select');
  sortSelect.id = 'sort-select';
  sortSelect.className = 'filters-selector';
  sortSelect.innerHTML = `
    <option value="">Sortierung wählen <hr></option>
    <option value="price-asc">Preis aufsteigend</option>
    <option value="price-desc">Preis absteigend</option>
    <option value="name-asc">Name A–Z</option>
    <option value="name-desc">Name Z–A</option>
    <option value="rating-desc">Bewertung absteigend</option>
    <option value="rating-asc">Bewertung aufsteigend</option>
  `;
  sortSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === '') {
      window.currentSearchOptions.sort = undefined;
      window.currentSearchOptions.order = undefined;
    } else {
      const [sort, order] = value.split('-');
      window.currentSearchOptions.sort = sort;
      window.currentSearchOptions.order = order;
    }
    loadProducts(selectedCategoryId, 1, window.currentSearchOptions);
  });

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Filter zurücksetzen';
  resetBtn.className = 'reset-filters-btn';

  resetBtn.addEventListener('click', () => {
    selectedCategoryId = null;
    selectedCategoryName = '';
    window.currentSearchOptions = {
      inStock: false,
      minPrice: undefined,
      maxPrice: undefined,
      name: '',
      sort: undefined,
      order: undefined
    };
    select.selectedIndex = 0;
    checkbox.checked = false;
    rangeMin.value = 0;
    rangeMax.value = 1000;
    rangeLabel.textContent = 'Preis: 0 € – 1000 €';
    document.getElementById('search-input').value = '';
    sortSelect.selectedIndex = 0;
    loadProducts();
  });

  filtersWrapper.appendChild(select);
  filtersWrapper.appendChild(sortSelect);
  filtersWrapper.appendChild(inStockDiv);
  filtersWrapper.appendChild(priceWrapper);

// Reset-Button bleibt oben
const wrapper = document.querySelector('.filters-wrapper');
if (wrapper) {
  wrapper.appendChild(resetBtn);
}
}

window.onload = async () => {
  await loadCategoryMap();
  await loadAndRenderCategoryFilter();
  await loadProducts();

  const searchInput = document.getElementById('search-input');
  const searchIcon = document.querySelector('.search-icon');

  function triggerSearch() {
    if (!searchInput) return;
    const name = searchInput.value.trim();
    window.currentSearchOptions.name = name;
    currentPage = 1;
    loadProducts(selectedCategoryId, currentPage, window.currentSearchOptions);
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

  const perPageSelect = document.getElementById('per-page-select');
  if (perPageSelect) {
    perPageSelect.addEventListener('change', (e) => {
      const newValue = parseInt(e.target.value);
      if (!isNaN(newValue)) {
        productsPerPage = newValue;
        currentPage = 1;
        loadProducts(selectedCategoryId, currentPage, window.currentSearchOptions);
      }
    });
  }
};