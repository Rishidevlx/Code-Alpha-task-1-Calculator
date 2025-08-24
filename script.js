const display = document.getElementById('display');
const historyList = document.getElementById('historyList');
let currentInput = '';
let evaluated = false;

// Load history from localStorage
function loadHistory() {
  historyList.innerHTML = '';
  let historyArr = JSON.parse(localStorage.getItem('calc-history') || '[]');
  historyArr.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.expr} = ${item.result}`;
    li.addEventListener('click', () => {
      display.textContent = item.expr;
      currentInput = item.expr;
    });
    historyList.appendChild(li);
  });
}
loadHistory();

// Parser assistance for scientific functions
function preprocessInput(input) {
  return input
    .replace(/π/g, 'Math.PI')
    .replace(/e/g, 'Math.E')
    .replace(/sin\(/g, 'Math.sin(deg2rad(')
    .replace(/cos\(/g, 'Math.cos(deg2rad(')
    .replace(/tan\(/g, 'Math.tan(deg2rad(')
    .replace(/ln\(/g, 'Math.log(')
    .replace(/log10\(/g, 'Math.log10(')
    .replace(/√/g, 'Math.sqrt')
    .replace(/∛/g, 'Math.cbrt')
    .replace(/(\d+|\))\^(\d+|\()?/g, 'Math.pow($1,$2)')
    .replace(/(\d+)!/g, 'factorial($1)');
}

// Degree to radian helper
function deg2rad(deg) {
  return deg * Math.PI / 180;
}
// Factorial helper
function factorial(n) {
  n = Number(n);
  if (n < 0 || isNaN(n)) return NaN;
  if (n === 0 || n === 1) return 1;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
}

// Button input
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const val = btn.dataset.val;
    if (val === undefined) return;
    if (evaluated && !isNaN(val)) {
      currentInput = '';
      display.textContent = '';
      evaluated = false;
    }
    currentInput += val;
    display.textContent = currentInput;
    evaluated = false;
  });
});

// Equals (=)
document.getElementById('equals').addEventListener('click', () => {
  try {
    let exp = preprocessInput(currentInput);
    // eslint-disable-next-line no-new-func
    let result = Function('deg2rad','factorial','Math','return '+exp)(deg2rad, factorial, Math);
    result = isNaN(result) ? "Error" : result;
    // Save to history
    let historyArr = JSON.parse(localStorage.getItem('calc-history') || '[]');
    historyArr.push({expr: currentInput, result: result});
    if (historyArr.length > 25) historyArr.shift(); // keep history to max 25
    localStorage.setItem('calc-history', JSON.stringify(historyArr));
    loadHistory();
    display.textContent = result;
    currentInput = ''+result;
    evaluated = true;
  } catch {
    display.textContent = "Error";
    currentInput = '';
    evaluated = true;
  }
});

// Clear
document.getElementById('clear').addEventListener('click', () => {
  display.textContent = '0';
  currentInput = '';
});

// Backspace
document.getElementById('backspace').addEventListener('click', () => {
  currentInput = currentInput.slice(0, -1);
  display.textContent = currentInput || '0';
});

// Clear history
document.getElementById('clearHistory').addEventListener('click', () => {
  localStorage.removeItem('calc-history');
  loadHistory();
});

// Keyboard support (optional)
window.addEventListener('keydown', e => {
  if ((e.key >= '0' && e.key <= '9') || "+-*/().".includes(e.key)) {
    currentInput += e.key;
    display.textContent = currentInput;
  }
  if (e.key === 'Enter') {
    document.getElementById('equals').click();
  }
  if (e.key === 'Backspace') {
    document.getElementById('backspace').click();
  }
  if (e.key.toLowerCase() === 'c') {
    document.getElementById('clear').click();
  }
});
