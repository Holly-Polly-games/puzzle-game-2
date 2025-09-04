const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const rows = 9;
const cols = 9;
const puzzleRows = 5;
const puzzleCols = 5;
let size;
let pieces = [];

const img = new Image();
img.src = "Balzam.jpg";
img.onload = () => {
  init();
  draw();
};

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth, window.innerHeight) * 0.95;
  canvas.height = canvas.width;
  size = canvas.width / cols;
  draw();
}
window.addEventListener("resize", resizeCanvas);

// Инициализация кусочков без наложений
function init() {
  pieces = [];
  const occupied = new Set();

  for (let y = 0; y < puzzleRows; y++) {
    for (let x = 0; x < puzzleCols; x++) {
      let rx, ry, key;
      do {
        rx = Math.floor(Math.random() * cols);
        ry = Math.floor(Math.random() * rows);
        key = rx + "-" + ry;
      } while (occupied.has(key));
      occupied.add(key);

      pieces.push({
        sx: x * img.width / puzzleCols,
        sy: y * img.height / puzzleRows,
        x: rx,
        y: ry,
        tmpX: null,
        tmpY: null
      });
    }
  }
  resizeCanvas();
}

// Рисуем сетку, рамку и кусочки
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Полупрозрачная сетка 9x9
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * size, 0);
    ctx.lineTo(i * size, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * size);
    ctx.lineTo(canvas.width, i * size);
    ctx.stroke();
  }

  // Контур зелёной рамки 5x5 с закруглёнными углами
  const frameX = 2 * size;
  const frameY = 2 * size;
  const frameWidth = size * puzzleCols;
  const frameHeight = size * puzzleRows;
  const radius = 20;

  ctx.strokeStyle = "#00aa00";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(frameX + radius, frameY);
  ctx.lineTo(frameX + frameWidth - radius, frameY);
  ctx.quadraticCurveTo(frameX + frameWidth, frameY, frameX + frameWidth, frameY + radius);
  ctx.lineTo(frameX + frameWidth, frameY + frameHeight - radius);
  ctx.quadraticCurveTo(frameX + frameWidth, frameY + frameHeight, frameX + frameWidth - radius, frameY + frameHeight);
  ctx.lineTo(frameX + radius, frameY + frameHeight);
  ctx.quadraticCurveTo(frameX, frameY + frameHeight, frameX, frameY + frameHeight - radius);
  ctx.lineTo(frameX, frameY + radius);
  ctx.quadraticCurveTo(frameX, frameY, frameX + radius, frameY);
  ctx.stroke();

  // Рисуем кусочки
  pieces.forEach(p => {
    const drawX = p.tmpX !== null ? p.tmpX : p.x * size;
    const drawY = p.tmpY !== null ? p.tmpY : p.y * size;

    ctx.drawImage(img, p.sx, p.sy, img.width / puzzleCols, img.height / puzzleRows,
      drawX, drawY, size, size);

    // рамка у кусочков с закруглёнными углами
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drawX + 10, drawY);
    ctx.lineTo(drawX + size - 10, drawY);
    ctx.quadraticCurveTo(drawX + size, drawY, drawX + size, drawY + 10);
    ctx.lineTo(drawX + size, drawY + size - 10);
    ctx.quadraticCurveTo(drawX + size, drawY + size, drawX + size - 10, drawY + size);
    ctx.lineTo(drawX + 10, drawY + size);
    ctx.quadraticCurveTo(drawX, drawY + size, drawX, drawY + size - 10);
    ctx.lineTo(drawX, drawY + 10);
    ctx.quadraticCurveTo(drawX, drawY, drawX + 10, drawY);
    ctx.stroke();
  });
}

// Проверка правильности внутри рамки
document.getElementById("check").addEventListener("click", () => {
  const frameX = 2;
  const frameY = 2;
  let correct = true;
  pieces.forEach((p, i) => {
    const centerX = p.x + 0.5;
    const centerY = p.y + 0.5;
    if (centerX >= frameX && centerX <= frameX + puzzleCols &&
      centerY >= frameY && centerY <= frameY + puzzleRows) {
      const targetX = (i % puzzleCols) + frameX + 0.5;
      const targetY = Math.floor(i / puzzleCols) + frameY + 0.5;
      if (Math.abs(centerX - targetX) > 0.3 || Math.abs(centerY - targetY) > 0.3) {
        correct = false;
      }
    }
  });
  alert(correct ? "Собрано!" : "Не все кусочки на месте!");
});

// Перемешивание заново
document.getElementById("shuffle").addEventListener("click", init);

// Перетаскивание с привязкой к сетке
let dragPiece = null;
let offsetX = 0, offsetY = 0;

canvas.addEventListener("pointerdown", e => {
  const mx = e.offsetX;
  const my = e.offsetY;
  dragPiece = pieces.find(p => {
    const px = p.tmpX !== null ? p.tmpX : p.x * size;
    const py = p.tmpY !== null ? p.tmpY : p.y * size;
    return mx >= px && mx <= px + size && my >= py && my <= py + size;
  });
  if (dragPiece) {
    offsetX = mx - (dragPiece.tmpX !== null ? dragPiece.tmpX : dragPiece.x * size);
    offsetY = my - (dragPiece.tmpY !== null ? dragPiece.tmpY : dragPiece.y * size);
    dragPiece.tmpX = dragPiece.x * size;
    dragPiece.tmpY = dragPiece.y * size;
  }
});

canvas.addEventListener("pointermove", e => {
  if (!dragPiece) return;
  dragPiece.tmpX = e.offsetX - offsetX;
  dragPiece.tmpY = e.offsetY - offsetY;
  draw();
});

canvas.addEventListener("pointerup", () => {
  if (!dragPiece) return;
  // Примагничивание к сетке
  dragPiece.x = Math.round(dragPiece.tmpX / size);
  dragPiece.y = Math.round(dragPiece.tmpY / size);
  dragPiece.tmpX = null;
  dragPiece.tmpY = null;
  dragPiece = null;
  draw();
});

canvas.addEventListener("pointerleave", () => {
  if (dragPiece) {
    dragPiece.tmpX = null;
    dragPiece.tmpY = null;
    dragPiece = null;
    draw();
  }
});
