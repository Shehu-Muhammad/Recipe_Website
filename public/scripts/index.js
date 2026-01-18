const serverBase = 'http://localhost:5000';
const pageSize = 9;

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

// Tab switching logic
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
    
    // Show/hide tab contents as before...
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(tab).classList.add('active');

    // Optional: move focus to the active tab for keyboard users
    button.focus();
  });
});

// Fetch recipes from server
async function fetchRecipes(mealType, containerId, page = 0) {
  const query = searchState[mealType];
  const apiType = apiMealTypeMap[mealType];
  const url = `${serverBase}/api/recipes?type=${apiType}&offset=${page * pageSize}${query ? `&query=${query}` : ''}`;

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

// Render recipe cards + pagination
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

  // Pagination buttons
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

  // Calculate max page (0-indexed)
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

// Search button handler (globally scoped!)
function handleSearch(mealType) {
  const input = document.getElementById(`${mealType}-search`);
  const query = input.value.trim();
  searchState[mealType] = query;
  pageState[mealType] = 0; // reset to first page
  fetchRecipes(mealType, mealType, 0);
}

function clearSearch(mealType) {
  const input = document.getElementById(`${mealType}-search`);
  const clearBtn = document.getElementById(`${mealType}-clear`);

  input.value = '';
  searchState[mealType] = '';
  pageState[mealType] = 0;
  fetchRecipes(mealType, mealType, 0);

  // Disable and style the clear button since input is now empty
  clearBtn.disabled = true;
  clearBtn.style.opacity = '0.5';
  clearBtn.style.cursor = 'default';
}


// Initial load
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

  // Set breakfast tab active (in case HTML doesn't already)
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  const breakfastTab = document.querySelector('.tab[data-tab="breakfast"]');
  breakfastTab.classList.add('active');
  breakfastTab.setAttribute('aria-selected', 'true');
  breakfastTab.setAttribute('tabindex', '0');

  // Show breakfast content, hide others
  document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
  document.getElementById('breakfast').classList.add('active');

  // Fetch recipes on page load
  fetchRecipes('breakfast', 'breakfast');
  fetchRecipes('lunch', 'lunch');
  fetchRecipes('dessert', 'dessert');
});

console.log('✅ Script loaded!');
