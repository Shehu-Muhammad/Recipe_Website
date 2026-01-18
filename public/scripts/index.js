/* =========================================
   Recipe Website Frontend Script
   Works locally and on Vercel
   Optimized: Lazy-loading tabs + Debounced search
========================================= */

// ------------------- CONFIG -------------------
const pageSize = 9;

// Auto-detect local vs production
const serverBase =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : '';

// ------------------- STATE -------------------
const pageState = {
  breakfast: 0,
  lunch: 0,
  dessert: 0
};

const searchState = {
  breakfast: '',
  lunch: '',
  dessert: ''
};

const apiMealTypeMap = {
  breakfast: 'breakfast',
  lunch: 'main course',
  dessert: 'dessert'
};

// Keep track of loaded tabs
const loadedTabs = new Set();

// ------------------- TAB SWITCHING -------------------
document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    // Lazy-load recipes for this tab
    loadTab(tab);

    // Update active tab UI
    document.querySelectorAll('.tab').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    button.setAttribute('tabindex', '0');

    // Show/hide tab contents
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(tab).classList.add('active');

    button.focus();
  });
});

// ------------------- FETCH RECIPES -------------------
async function fetchRecipes(mealType, containerId, page = 0) {
  const query = searchState[mealType];
  const apiType = apiMealTypeMap[mealType];

  const url = `${serverBase}/api/recipes?type=${apiType}&offset=${page * pageSize}${query ? `&query=${encodeURIComponent(query)}` : ''}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recipes');
    const data = await res.json();
    renderRecipes(data.results, containerId, mealType, data.totalResults);
  } catch (err) {
    console.error('Frontend fetch error:', err);
    const recipesContainer = document.getElementById(`${containerId}-recipes`);
    recipesContainer.innerHTML = '<p style="text-align:center;">Failed to load recipes. Please try again later.</p>';
  }
}

// ------------------- RENDER RECIPES + PAGINATION -------------------
function renderRecipes(recipes, containerId, mealType, totalResults) {
  const recipesContainer = document.getElementById(`${containerId}-recipes`);
  const paginationContainer = document.getElementById(`${containerId}-pagination`);
  recipesContainer.innerHTML = '';
  paginationContainer.innerHTML = '';

  recipes.forEach(recipe => {
    const template = document.getElementById('recipe-card-template').content.cloneNode(true);
    template.querySelector('img').src = recipe.image;
    template.querySelector('img').alt = recipe.title;
    template.querySelector('.recipe-title').textContent = recipe.title;
    template.querySelector('.recipe-summary').textContent = recipe.summary.replace(/<[^>]+>/g, '').slice(0, 100) + '...';
    template.querySelector('.recipe-link').href = recipe.sourceUrl;
    recipesContainer.appendChild(template);
  });

  // Pagination
  const prev = document.createElement('button');
  prev.textContent = '⟵ Prev';
  prev.disabled = pageState[mealType] === 0;
  prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false');
  prev.onclick = () => {
    if (!prev.disabled) {
      pageState[mealType]--;
      fetchRecipes(mealType, containerId, pageState[mealType]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const next = document.createElement('button');
  next.textContent = 'Next ⟶';
  const maxPage = Math.floor((totalResults - 1) / pageSize);
  next.disabled = pageState[mealType] >= maxPage;
  next.setAttribute('aria-disabled', next.disabled ? 'true' : 'false');
  next.onclick = () => {
    if (!next.disabled) {
      pageState[mealType]++;
      fetchRecipes(mealType, containerId, pageState[mealType]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  paginationContainer.appendChild(prev);
  paginationContainer.appendChild(next);
}

// ------------------- LAZY LOAD TAB -------------------
function loadTab(mealType) {
  if (loadedTabs.has(mealType)) return;
  loadedTabs.add(mealType);
  fetchRecipes(mealType, mealType);
}

// ------------------- SEARCH HANDLERS (Debounced) -------------------
const searchTimeouts = {};
function handleSearch(mealType) {
  clearTimeout(searchTimeouts[mealType]);
  searchTimeouts[mealType] = setTimeout(() => {
    const input = document.getElementById(`${mealType}-search`);
    searchState[mealType] = input.value.trim();
    pageState[mealType] = 0;
    fetchRecipes(mealType, mealType, 0);
  }, 400);
}

function clearSearch(mealType) {
  const input = document.getElementById(`${mealType}-search`);
  const clearBtn = document.getElementById(`${mealType}-clear`);

  input.value = '';
  searchState[mealType] = '';
  pageState[mealType] = 0;
  fetchRecipes(mealType, mealType, 0);

  clearBtn.disabled = true;
  clearBtn.style.opacity = '0.5';
  clearBtn.style.cursor = 'default';
}

// ------------------- INITIALIZATION -------------------
document.addEventListener('DOMContentLoaded', () => {
  ['breakfast', 'lunch', 'dessert'].forEach(meal => {
    const input = document.getElementById(`${meal}-search`);
    const clearBtn = document.getElementById(`${meal}-clear`);

    input.addEventListener('input', () => {
      if (input.value.trim().length > 0) {
        clearBtn.disabled = false;
        clearBtn.style.opacity = '1';
        clearBtn.style.cursor = 'pointer';
      } else {
        clearBtn.disabled = true;
        clearBtn.style.opacity = '0.5';
        clearBtn.style.cursor = 'default';
      }

      handleSearch(meal);
    });
  });

  // Default active tab: breakfast
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  const breakfastTab = document.querySelector('.tab[data-tab="breakfast"]');
  breakfastTab.classList.add('active');
  breakfastTab.setAttribute('aria-selected', 'true');
  breakfastTab.setAttribute('tabindex', '0');

  // Show breakfast content
  document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
  document.getElementById('breakfast').classList.add('active');

  // Load initial tab
  loadTab('breakfast');
});

console.log('✅ Recipe website frontend script loaded!');
