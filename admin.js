
function uploadJSON() {
  const fileInput = document.getElementById('jsonFile');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a JSON file!");
    return;
  }

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!data.themes || !Array.isArray(data.themes)) {
        alert("Invalid JSON format. Expected { themes: [{ theme:'', words: [] }, ...] }");
        return;
      }

      // ✅ Save to Firestore (overwrite previous themes)
      db.collection("wordsearch").doc("themes").set({ themes: data.themes })
        .then(() => {
          displayThemes(data.themes);
          alert("✅ Themes uploaded to Firebase! All users will now see these themes.");
        })
        .catch(err => {
          console.error("Error saving to Firebase:", err);
          alert("❌ Failed to save themes to Firebase.");
        });
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
    block.innerHTML = `<h3>Theme ${i + 1}: ${themeObj.theme}</h3>
      <ul>${themeObj.words.map(w => `<li>${w}</li>`).join("")}</ul>`;
    container.appendChild(block);
  });
}

// ✅ Auto-load last uploaded file from Firebase
window.addEventListener("load", () => {
  db.collection("wordsearch").doc("themes").get().then(doc => {
    if (doc.exists) {
      const data = doc.data();
      if (data.themes) displayThemes(data.themes);
    }
  });
});

function clearThemes() {
  if (!confirm("⚠️ Are you sure you want to delete ALL themes? This cannot be undone.")) {
    return;
  }

  // Overwrites the document with an empty themes array
  db.collection("wordsearch").doc("themes").set({ themes: [] })
    .then(() => {
      // Reset the UI
      const container = document.getElementById('uploaded-words');
      container.innerHTML = "No themes uploaded yet.";
      alert("✅ All themes have been cleared.");
    })
    .catch(err => {
      console.error("Error clearing themes:", err);
      alert("❌ Failed to clear themes.");
    });
