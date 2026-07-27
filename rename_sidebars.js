const fs = require('fs');
const path = require('path');

function toSentenceCase(str) {
  if (!str) return str;
  // Make first char upper, rest lower
  let res = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  // Restore acronyms
  res = res.replace(/api/gi, 'API');
  res = res.replace(/websockets/gi, 'WebSockets');
  res = res.replace(/gatein/gi, 'GateIn');
  res = res.replace(/app/gi, 'App');
  res = res.replace(/pt-br/gi, 'PT-BR');
  return res;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file === '_category_.json') {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (data.label) {
        data.label = toSentenceCase(data.label);
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
      }
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      // Replace title in frontmatter
      content = content.replace(/^title:\s*(.*)$/m, (match, p1) => {
        changed = true;
        return 'title: ' + toSentenceCase(p1.replace(/["']/g, ''));
      });
      // Replace sidebar_label if exists
      content = content.replace(/^sidebar_label:\s*(.*)$/m, (match, p1) => {
        changed = true;
        return 'sidebar_label: ' + toSentenceCase(p1.replace(/["']/g, ''));
      });
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDir('c:/Users/rafae/Documents/gatein/gatein-docs/docs');
console.log('Done renaming titles.');