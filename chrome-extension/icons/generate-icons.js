// Generate Show extension icons at 16, 32, 48, 128px
// Run: node generate-icons.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 48, 128];

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Gradient background circle
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#3b27b2');
  gradient.addColorStop(0.5, '#8227b2');
  gradient.addColorStop(1, '#b61cc9');

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Play triangle
  ctx.fillStyle = 'white';
  ctx.beginPath();
  const cx = size / 2 + (size * 0.025);
  const cy = size / 2;
  const s = size * 0.35;
  ctx.moveTo(cx - s * 0.4, cy - s * 0.5);
  ctx.lineTo(cx + s * 0.55, cy);
  ctx.lineTo(cx - s * 0.4, cy + s * 0.5);
  ctx.closePath();
  ctx.fill();

  return canvas;
}

const iconsDir = __dirname;

sizes.forEach((size) => {
  const canvas = drawIcon(size);
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✓ Generated ${filePath}`);
});

console.log('\nAll icons generated!');
