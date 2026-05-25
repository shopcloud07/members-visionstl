const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Millynho\\Downloads\\AREA DE MEMBROS DO STL';

// Recurse directories to find index.html files
function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        getFiles(name, files);
      }
    } else {
      if (file.endsWith('.html')) {
        files.push(name);
      }
    }
  }
  return files;
}

const htmlFiles = getFiles(rootDir);

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Replace all variations of VISION PRIME STL | <something> in titles and json strings
  // This regex matches "VISION PRIME STL | <anything except quote, backslash, less-than>"
  content = content.replace(/VISION PRIME STL (3D )?\| [^"\\<]+/g, 'VISION PRIME STL');

  // 2. Replace all instances of printer icon urls in the entire file (HTML and JSON)
  content = content.replace(/https:\/\/img\.icons8\.com\/ios-filled\/192\/078bfb\/printer\.png/g, 'https://img.icons8.com/ios-filled/192/078bfb/visible.png');
  content = content.replace(/https:\/\/img\.icons8\.com\/ios-filled\/512\/078bfb\/printer\.png/g, 'https://img.icons8.com/ios-filled/512/078bfb/visible.png');

  // 3. Replace all references to "/favicon.ico" with the new visible eye icon
  content = content.replace(/\/favicon\.ico/g, 'https://img.icons8.com/ios-filled/192/078bfb/visible.png');

  // 4. Double check HTML specific tags
  content = content.replace(/<title>[^<]+<\/title>/g, (match) => {
    if (match.includes('Redirecionando')) return match;
    return '<title>VISION PRIME STL</title>';
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${path.relative(rootDir, file)}`);
  }
});
