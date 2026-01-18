const pageSize = 9;

// State tracking
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

// ------------------- TAB SWITCHING -------------------
document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    // Update tab selected state & tabindex
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

  // ✅ Use relative URL — works locally + on Vercel
  const url = `/api/recipes?type=${apiType}&offset=${page * pageSize}${query ? `&query=${encodeURIComponent(query)}` : ''}`;

  try {
    const res = await fetch(url);
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

  // Render recipe cards
  recipes.forEach(recipe => {
    const template = document.getElementById('recipe-card-template').content.cloneNode(true);
    template.querySelector('img').src = recipe.image;
    template.querySelector('img').alt = recipe.title;
    template.querySelector('.recipe-title').textContent = recipe.title;
    template.querySelector('.recipe-summary').textContent = recipe.summary.replace(/<[^>]+>/g, '').slice(0, 100) + '...';
    template.querySelector('.recipe-link').href = recipe.sourceUrl;
    recipesContainer.appendChild(template);
  });

  // ------------------- PAGINATION -------------------
  const prev = document.createElement('button');
  prev.textContent = '⟵ Prev';
  prev.disabled = pageState[mealType] === 0;
  prev.setAttribute('aria-disabled', prev.disabled ? 'true' : 'false');
  prev.onclick = () => {
    if(!prev.disabled) {
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

// ------------------- SEARCH HANDLERS -------------------
function handleSearch(mealType) {
  const input = document.getElementById(`${mealType}-search`);
  searchState[mealType] = input.value.trim();
  pageState[mealType] = 0;
  fetchRecipes(mealType, mealType, 0);
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

  // Fetch initial recipes
  fetchRecipes('breakfast', 'breakfast');
  fetchRecipes('lunch', 'lunch');
  fetchRecipes('dessert', 'dessert');
});

console.log('✅ Script loaded!');
