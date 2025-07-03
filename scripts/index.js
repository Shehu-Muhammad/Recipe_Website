document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    document.querySelectorAll('.tab-content').forEach(section => {
      section.classList.remove('active');
    });

    document.getElementById(tab).classList.add('active');
  });
});
