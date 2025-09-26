const fs = require('fs');
const path = require('path');

// Configuration
const imagesDir = path.join(__dirname, '..', 'images');
const projectsFile = path.join(__dirname, '..', 'projects.html');

function isImage(filename) {
  return /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(filename);
}

function buildTileHtml(imgRelPath, idx) {
  // Use data-img for image and fallback data-media gradient
  return `          <a href="#" class="project-tile" data-img="${imgRelPath}" data-media="linear-gradient(135deg,var(--primary),var(--accent))" aria-label="Open project image ${idx}">\n            <span class="tile-media" aria-hidden="true"></span>\n          </a>\n`;
}

// Read projects.html and replace between markers
let html = fs.readFileSync(projectsFile, 'utf8');
const startMarker = '<!-- PROJECTS_START -->';
const endMarker = '<!-- PROJECTS_END -->';
const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);
if(start === -1 || end === -1) {
  console.error('Markers not found in projects.html');
  process.exit(1);
}

// Generate tiles for all images in imagesDir
const files = fs.readdirSync(imagesDir).filter(isImage);
let tilesHtml = '        <div class="projects-grid">\n';
files.forEach((f, i) => {
  const rel = `images/${f}`;
  tilesHtml += buildTileHtml(rel, i+1);
});
tilesHtml += '        </div>';

// Replace region
const newHtml = html.slice(0, start) + startMarker + '\n' + tilesHtml + '\n' + endMarker + html.slice(end + endMarker.length);
fs.writeFileSync(projectsFile, newHtml, 'utf8');
console.log(`Inserted ${files.length} tiles into projects.html`);
