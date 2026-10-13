const rows = 20;
const cols = 30;
const gridElement = document.querySelector('#grid');
const buttons = {
  start: document.querySelector('#start'),
  stop: document.querySelector('#stop'),
  clear: document.querySelector('#clear'),
  random: document.querySelector('#random'),
  example: document.querySelector('#example')
};
const speedInput = document.querySelector('#speed');
const speedValue = document.querySelector('#speed-value');
const generationOutput = document.querySelector('#generation');
const aliveOutput = document.querySelector('#alive-count');
const stateOutput = document.querySelector('#state');

let cells = Array.from({ length: rows }, () => Array(cols).fill(false));
let cellButtons = [];
let generation = 0;
let intervalId = null;
let tabStopIndex = 0;

function cellIndex(row, col) { return row * cols + col; }

function render() {
  let alive = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const active = cells[row][col];
      if (active) alive++;
      const button = cellButtons[cellIndex(row, col)];
      button.classList.toggle('alive', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  generationOutput.textContent = String(generation);
  aliveOutput.textContent = String(alive);
}

function stop() {
  if (intervalId !== null) window.clearInterval(intervalId);
  intervalId = null;
  buttons.start.disabled = false;
  buttons.stop.disabled = true;
  stateOutput.textContent = 'Pausado';
}

function step() {
  const next = cells.map((line, row) => line.map((active, col) => {
    let neighbours = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const rr = row + dr;
        const cc = col + dc;
        if (rr >= 0 && rr < rows && cc >= 0 && cc < cols && cells[rr][cc]) neighbours++;
      }
    }
    return active ? neighbours === 2 || neighbours === 3 : neighbours === 3;
  }));
  cells = next;
  generation++;
  render();
  if (!next.some((line) => line.some(Boolean))) stop();
}

function start() {
  if (intervalId !== null) return;
  intervalId = window.setInterval(step, Number(speedInput.value));
  buttons.start.disabled = true;
  buttons.stop.disabled = false;
  stateOutput.textContent = 'Activo';
}

function reset() {
  stop();
  generation = 0;
}

function seedExample() {
  reset();
  cells = Array.from({ length: rows }, () => Array(cols).fill(false));
  const glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
  [[3, 3], [9, 14], [13, 23]].forEach(([top, left]) => {
    glider.forEach(([dr, dc]) => { cells[top + dr][left + dc] = true; });
  });
  stateOutput.textContent = 'Listo';
  render();
}

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cell';
    button.setAttribute('aria-label', `Fila ${row + 1}, columna ${col + 1}`);
    button.setAttribute('aria-pressed', 'false');
    button.tabIndex = row === 0 && col === 0 ? 0 : -1;
    button.addEventListener('focus', () => {
      cellButtons[tabStopIndex].tabIndex = -1;
      button.tabIndex = 0;
      tabStopIndex = cellIndex(row, col);
    });
    button.addEventListener('click', () => {
      button.focus();
      cells[row][col] = !cells[row][col];
      render();
    });
    button.addEventListener('keydown', (event) => {
      const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      const nextRow = Math.max(0, Math.min(rows - 1, row + move[0]));
      const nextCol = Math.max(0, Math.min(cols - 1, col + move[1]));
      const nextButton = cellButtons[cellIndex(nextRow, nextCol)];
      nextButton.focus();
    });
    gridElement.appendChild(button);
    cellButtons.push(button);
  }
}

buttons.start.addEventListener('click', start);
buttons.stop.addEventListener('click', stop);
buttons.clear.addEventListener('click', () => {
  reset();
  cells = Array.from({ length: rows }, () => Array(cols).fill(false));
  stateOutput.textContent = 'Listo';
  render();
});
buttons.random.addEventListener('click', () => {
  reset();
  cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() < 0.25));
  stateOutput.textContent = 'Listo';
  render();
});
buttons.example.addEventListener('click', seedExample);
speedInput.addEventListener('input', () => {
  speedValue.textContent = `${speedInput.value} ms`;
  if (intervalId !== null) { stop(); start(); }
});

seedExample();
