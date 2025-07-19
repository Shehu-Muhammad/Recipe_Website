# 🍽️ My Recipe Hub

A responsive recipe search app that lets users explore breakfast, lunch/dinner, and dessert/snack recipes. Built with accessibility in mind and powered by the Spoonacular API.

---

## ✨ Features

- 🔍 Search for recipes by keyword across different meal types  
- 📖 Paginated results with responsive layout  
- 🧁 Recipe cards with images, summaries, and links to full instructions  
- ✅ Clear search button dynamically enabled/disabled  
- ♿ Accessible UI with keyboard navigation and ARIA roles  

---

## 📸 Preview

<!-- Replace the path below with your own image or GIF -->
<!-- Example: ![Preview](./screenshot.png) -->
<!-- Example hosted preview: ![Live Demo](https://yourdomain.com/preview.gif) -->
![Live Demo](./server/public/assets/Recipe_Hub_MVP.mp4)
---

## 🚀 Getting Started

Follow these steps to set up the project on your local machine:

---

### ✅ Step 1: Clone the Repository

```bash
git clone https://github.com/Shehu-Muhammad/Recipe_Website.git
cd Recipe_Website
```
---
### ✅ Step 2: Install Dependencies

Make sure you have **Node.js** and **npm** installed.  
Then run the following command in your project directory:

```bash
npm install
```
---

### ✅ Step 3: Set Up Environment Variables  
Create a .env file in the root directory of your project and add your Spoonacular API key:

```env
# .env
SPOONACULAR_API_KEY=your_api_key_here
```

You can get a free API key by signing up at:
🔗 https://spoonacular.com/food-api

---

### ✅ Step 4: Start the Backend Server
Start the Express server that proxies API requests to Spoonacular:
node server.js

By default, it runs at:
🌐 http://localhost:5000

---

### ✅ Step 5: Open the Frontend
You can now view the frontend in your browser.

Option A: Open index.html Directly
Navigate to the public/ folder and open index.html.

Option B: Use Live Server (Recommended)
If you're using VS Code with the Live Server extension:

Right-click index.html

Select "Open with Live Server"

This provides live reloading and better development workflow.

---

### ✅ Step 6: Search & Browse Recipes
Use the search bar to look up recipes by keyword.

Switch between Breakfast, Lunch & Dinner, and Desserts & Snacks tabs.

Click "View Recipe" to open the full recipe in a new tab.

Use "❌ Clear" to reset your search input.

### 🛠️ Technologies Used
- HTML, CSS, JavaScript
- Spoonacular API
- Node.js (Express backend to protect API key)

---

### 📁 Project Structure

```
Recipe_Website/
├── public/
│   └── index.html
├── styles/
│   └── main.css
├── scripts/
│   └── index.js
├── server.js
├── .env
└── README.md
```

---

### 🤝 Contributing
Pull requests are welcome!
For major changes, please open an issue first to discuss what you’d like to change.

## 📄 License

This project is licensed under the [MIT License](LICENSE).