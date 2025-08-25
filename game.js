let currentThemeIndex = 0;
let allThemes = [];

class WordSearchGenerator {
    constructor(size = 10) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(''));
        this.placedWords = [];

        this.foundWords = new Set();
        this.score = 0;
        this.currentWords = [];
        this.currentTheme = '';
        this.firstClick = null;
        this.clickTimer = null;
        this.timerInterval = null;
        this.remainingTime = 0;

        this.directions = {
            horizontal: [0, 1],
            vertical: [1, 0],
            diagonal_down: [1, 1],
            diagonal_up: [-1, 1]
        };
    }

    async loadWordsFromJSON(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            return {
                words: data.words || [],
                theme: data.theme || 'Word Search'
            };
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return { words: [], theme: 'Word Search' };
        }
    }

    canPlaceWord(word, row, col, direction) {
        word = word.toUpperCase();
        const [dr, dc] = this.directions[direction];
        
        const endRow = row + dr * (word.length - 1);
        const endCol = col + dc * (word.length - 1);
        
        if (endRow < 0 || endRow >= this.size || endCol < 0 || endCol >= this.size) {
            return false;
        }

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + dr * i;
            const currentCol = col + dc * i;
            const currentCell = this.grid[currentRow][currentCol];
            
            if (currentCell !== '' && currentCell !== word[i]) {
                return false;
            }
        }
        return true;
    }

    placeWord(word, row, col, direction) {
        word = word.toUpperCase();
        const [dr, dc] = this.directions[direction];
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
            const currentRow = row + dr * i;
            const currentCol = col + dc * i;
            this.grid[currentRow][currentCol] = word[i];
            positions.push([currentRow, currentCol]);
        }
        
        this.placedWords.push({
            word: word,
            start: [row, col],
            direction: direction,
            positions: positions
        });
    }

    addWordsToGrid(words) {
        const directionKeys = Object.keys(this.directions);
        for (const word of words) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;
            
            while (!placed && attempts < maxAttempts) {
                const row = Math.floor(Math.random() * this.size);
                const col = Math.floor(Math.random() * this.size);
                const direction = directionKeys[Math.floor(Math.random() * directionKeys.length)];
                
                if (this.canPlaceWord(word, row, col, direction)) {
                    this.placeWord(word, row, col, direction);
                    placed = true;
                    console.log(`Placed '${word}' at (${row}, ${col}) ${direction}`);
                }
                attempts++;
            }
            if (!placed) console.warn(`Could not place word '${word}'`);
        }
    }

    fillEmptyCells() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === '') {
                    this.grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    generateGridHTML() {
        let html = '<div class="coordinates">   ';
        for (let i = 0; i < this.size; i++) {
            html += String.fromCharCode(65 + i) + '  ';
        }
        html += '</div>';
        
        html += '<div class="grid" id="word-grid">';
        for (let row = 0; row < this.size; row++) {
            html += '<div class="grid-row">';
            for (let col = 0; col < this.size; col++) {
                html += `<div class="grid-cell" data-row="${row}" data-col="${col}"
                          onclick="handleCellClick(${row}, ${col})">${this.grid[row][col]}</div>`;
            }
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    generateWordListHTML() {
        let html = `<div class="word-list">`;
        html += `<h3>${this.currentTheme} - Find ${this.currentWords.length} words:</h3>`;
        html += '<ul>';
        this.currentWords.forEach((word, index) => {
            const isFound = this.foundWords.has(word.toUpperCase());
            const foundClass = isFound ? 'found' : '';
            html += `<li class="word-item ${foundClass}">${index + 1}. ${word.toUpperCase()}</li>`;
        });
        html += '</ul></div>';
        return html;
    }
     
    handleCellClick(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!this.firstClick) {
            this.firstClick = { row, col, cell };
            cell.classList.add('first-selected');
            this.startTimer();
        } else {
            this.clearTimer();
            this.validateWordSelection(row, col);
            this.clearSelection();
        }
    }

    startTimer() {
        this.remainingTime = 5;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            if (this.remainingTime <= 0) {
                this.clearTimer();
                this.clearSelection();
                this.showInvalidSelection();
            }
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        document.getElementById('timer-display').textContent = '';
    }

    updateTimerDisplay() {
        document.getElementById('timer-display').textContent = 
            this.remainingTime > 0 ? `Time remaining: ${this.remainingTime}s` : '';
    }

    clearSelection() {
        if (this.firstClick) {
            this.firstClick.cell.classList.remove('first-selected');
            this.firstClick = null;
        }
        document.querySelectorAll('.invalid-selection').forEach(cell => {
            cell.classList.remove('invalid-selection');
        });
    }

    validateWordSelection(lastRow, lastCol) {
        const firstRow = this.firstClick.row;
        const firstCol = this.firstClick.col;
        
        for (const placedWord of this.placedWords) {
            if (this.foundWords.has(placedWord.word)) continue;
            const positions = placedWord.positions;
            const firstPos = positions[0];
            const lastPos = positions[positions.length - 1];
            
            if ((firstPos[0] === firstRow && firstPos[1] === firstCol && 
                 lastPos[0] === lastRow && lastPos[1] === lastCol) ||
                (firstPos[0] === lastRow && firstPos[1] === lastCol && 
                 lastPos[0] === firstRow && lastPos[1] === firstCol)) {
                this.selectWord(placedWord.word);
                return;
            }
        }
        this.showInvalidSelection();
    }

    showInvalidSelection() {
        this.showMessage('Invalid word selection!', 'error');
    }

    selectWord(word) {
        word = word.toUpperCase();
        if (this.foundWords.has(word)) return;
        const placedWord = this.placedWords.find(pw => pw.word === word);
        if (!placedWord) return;
        
        this.foundWords.add(word);
        this.score += 10;
        
        this.updateScore();
        this.highlightFoundWord(placedWord);
        this.updateWordList();
        this.showPointsAnimation();
        this.updateProgress();
        this.showMessage(`Found: ${word}!`, 'success');
        
        if (this.foundWords.size === this.currentWords.length) {
            this.showGameComplete();
        }
    }

    showMessage(text, type) {
        const container = document.getElementById('points-animation-container');
        const messageElement = document.createElement('div');
        messageElement.className = 'points-animation';
        messageElement.style.color = type === 'error' ? '#ff5722' : '#00ff00';
        messageElement.textContent = text;
        container.appendChild(messageElement);
        setTimeout(() => {
            if (container.contains(messageElement)) {
                container.removeChild(messageElement);
            }
        }, 2000);
    }

    updateScore() {
        document.getElementById('current-score').textContent = this.score;
    }

    highlightFoundWord(placedWord) {
        placedWord.positions.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('found');
        });
    }

    updateWordList() {
        document.getElementById('word-list-container').innerHTML = this.generateWordListHTML();
    }

    showPointsAnimation() {
        const container = document.getElementById('points-animation-container');
        const pointsElement = document.createElement('div');
        pointsElement.className = 'points-animation';
        pointsElement.textContent = '+10 Points!';
        container.appendChild(pointsElement);
        setTimeout(() => container.removeChild(pointsElement), 2000);
    }

    updateProgress() {
        const progress = (this.foundWords.size / this.currentWords.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('words-found').textContent = this.foundWords.size;
        document.getElementById('total-words').textContent = this.currentWords.length;
    }

    showGameComplete() {
        document.getElementById('game-complete-message').innerHTML = `
            <div class="game-complete">
                🎉 Congratulations! 🎉<br>
                You found all words!<br>
                Final Score: ${this.score} points
            </div>
        `;
        setTimeout(() => {
            currentThemeIndex++;
            loadCurrentTheme();
        }, 3000);
    }

    async generatePuzzle(words = null, theme = 'Word Search') {
        this.clearTimer();
        this.clearSelection();
        this.foundWords.clear();
        this.score = 0;
        this.currentWords = [...words];
        this.currentTheme = theme;

        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(''));
        this.placedWords = [];
        
        this.addWordsToGrid(words);
        this.fillEmptyCells();
        
        document.getElementById('puzzle-grid').innerHTML = this.generateGridHTML();
        document.getElementById('word-list-container').innerHTML = this.generateWordListHTML();
        this.updateScore();
        this.updateProgress();
        document.getElementById('game-complete-message').innerHTML = '';
        
        return { grid: this.grid, words, theme };
    }
}

// Global instance
const generator = new WordSearchGenerator(10);

const defaultWords = {
    words: ["AMATA", "MAMA", "KURYA", "KUGURUKA", "INZU", "ISUKU", "AMAFARANGA", "UMUTIMA", "UMUSORE", "UMUKOBWA"],
    theme: "Default Puzzle"
};

// Load themes saved by Admin
async function loadGameThemes() {
  try {
    const doc = await db.collection("wordsearch").doc("themes").get();
    
    if (doc.exists) {
      allThemes = doc.data().themes;
      
      if (allThemes.length > 0) {
        // Populate the dropdown
        const selector = document.getElementById('theme-selector');
        selector.innerHTML = '<option value="">-- Select Theme --</option>';
        allThemes.forEach((t, i) => {
          const option = document.createElement('option');
          option.value = i;
          option.text = t.theme;
          selector.appendChild(option);
        });
        return;
      }
    }

    // ❌ No Admin themes found → pick random fallback
    const randomIndex = Math.floor(Math.random() * defaultThemes.length);
    const chosen = defaultThemes[randomIndex];
    console.log("⚡ Using random fallback theme:", chosen.theme);
    await generator.generatePuzzle(chosen.words, chosen.theme);

  } catch (err) {
    console.error("Error loading from Firebase:", err);
  }

  // fallback if no admin data
  await generator.generatePuzzle(defaultWords.words, defaultWords.theme);
}

function onThemeSelected(index) {
  if (index === "") return;
  currentThemeIndex = parseInt(index);
  loadCurrentTheme();
}

function loadCurrentTheme() {
  if (currentThemeIndex < allThemes.length) {
    const themeObj = allThemes[currentThemeIndex];
    console.log(`🎯 Loading Theme ${currentThemeIndex+1}: ${themeObj.theme}`);
    generator.generatePuzzle(themeObj.words, themeObj.theme);
    // Update dropdown
    document.getElementById('theme-selector').value = currentThemeIndex;
  } else {
    showAllThemesComplete();
  }
}

function showAllThemesComplete() {
  document.getElementById('puzzle-grid').innerHTML = "";
  document.getElementById('word-list-container').innerHTML = "";
  document.getElementById('game-complete-message').innerHTML = `
    <div class="game-complete">
      🏆 Congratulations!<br>
      You have completed ALL ${allThemes.length} themes!
    </div>
  `;
}

function handleCellClick(row, col) {
    generator.handleCellClick(row, col);
}

// Run on page load
window.addEventListener('load', loadGameThemes);