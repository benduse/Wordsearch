// js/admin.js

function uploadJSON() {
  const fileInput = document.getElementById('jsonFile');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON file!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {
    try {
      const data = JSON.parse(event.target.result);

      // Expecting { "themes": [{ "theme": "Animals", "words": ["CAT","DOG"] }, ...] }
      if (!data.themes || !Array.isArray(data.themes)) {
        alert("Invalid JSON: Expected { themes: [{ theme: '', words: [] }, ...] }");
        return;
      }

      // ✅ Save themes for user game (in browser localStorage)
      localStorage.setItem('wordSearchThemes', JSON.stringify(data.themes));

      // ✅ Show uploaded themes in the admin portal
      displayThemes(data.themes);

      alert("✅ Themes successfully uploaded and saved for users!");
    } catch (error) {
      alert("Error parsing JSON: " + error.message);
    }
  };

  reader.readAsText(file);
}

function displayThemes(themes) {
  const container = document.getElementById('uploaded-words');
  container.innerHTML = "";

  themes.forEach((themeObj, i) => {
    const block = document.createElement('div');
    block.innerHTML = `
      <h3>Theme ${i+1}: ${themeObj.theme}</h3>
      <ul>${themeObj.words.map(w => `<li>${w}</li>`).join("")}</ul>
    `;
    container.appendChild(block);
  });
}

// ✅ Auto-load any saved data when the page opens
window.addEventListener("load", () => {
  const saved = localStorage.getItem('wordSearchThemes');
  if (saved) {
    displayThemes(JSON.parse(saved));
  }
});

function clearThemes() {
  localStorage.removeItem('wordSearchThemes');
  document.getElementById('uploaded-words').innerHTML = "No themes uploaded yet.";
  alert("❌ All themes cleared. User will now fall back to defaults.");
}