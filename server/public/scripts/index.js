const serverBase = 'http://localhost:5000';
const pageSize = 9;
const pageState = {
  breakfast: 0,
  lunch: 0,
  dessert: 0
};

window.scrollTo({
  top: 0,
  behavior: 'smooth'
});

document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    // Remove active from all tabs
    document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
    // Add active to clicked tab
    button.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });

    // Show the clicked tab's content
    document.getElementById(tab).classList.add('active');
  });
});

async function fetchRecipes(mealType, containerId, page = 0) {
  try {
    const res = await fetch(`${serverBase}/api/recipes?type=${mealType}&offset=${page * pageSize}`);
    const data = await res.json();
    renderRecipes(data.results, containerId, mealType);
  } catch (err) {
    console.error('Frontend fetch error:', err);
  }
}

function renderRecipes(recipes, containerId, mealType) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  recipes.forEach(recipe => {
    const template = document.getElementById('recipe-card-template').content.cloneNode(true);
    template.querySelector('img').src = recipe.image;
    template.querySelector('.recipe-title').textContent = recipe.title;
    template.querySelector('.recipe-summary').textContent = recipe.summary.replace(/<[^>]+>/g, '').slice(0, 100) + '...';
    template.querySelector('.recipe-link').href = recipe.sourceUrl;
    container.appendChild(template);
  });

  // Add pagination
  const pagination = document.createElement('div');
  pagination.classList.add('pagination');

  const prev = document.createElement('button');
  prev.textContent = '⟵ Prev';
  prev.disabled = pageState[mealType] === 0;
  prev.onclick = () => {
    pageState[mealType]--;
    fetchRecipes(mealType, containerId, pageState[mealType]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = document.createElement('button');
  next.textContent = 'Next ⟶';
  next.onclick = () => {
    pageState[mealType]++;
    fetchRecipes(mealType, containerId, pageState[mealType]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  pagination.appendChild(prev);
  pagination.appendChild(next);
  container.appendChild(pagination);
}

document.addEventListener('DOMContentLoaded', () => {
  fetchRecipes('breakfast', 'breakfast');
  fetchRecipes('main course', 'lunch');
  fetchRecipes('dessert', 'dessert');
});

console.log('✅ Script loaded!');
