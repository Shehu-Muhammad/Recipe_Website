document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(tab).classList.add('active');
  });
});

const serverBase = 'http://localhost:5000';

async function fetchRecipes(mealType, containerId) {
  try {
    const res = await fetch(`${serverBase}/api/recipes?type=${mealType}`);
    const data = await res.json();
    renderRecipes(data.results, containerId);
  } catch (err) {
    console.error('Frontend fetch error:', err);
  }
}

function renderRecipes(recipes, containerId) {
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
}

document.addEventListener('DOMContentLoaded', () => {
  fetchRecipes('breakfast', 'breakfast');
  fetchRecipes('main course', 'lunch');
  fetchRecipes('dessert', 'dessert');
});

console.log('✅ Script loaded!');
