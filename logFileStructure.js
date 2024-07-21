const fs = require('fs');
const path = require('path');

// Directories to scan
const directories = {
  global: 'src/global',
  components: 'src/components',
  sections: 'src/sections',
  templates: 'src/templates',
  assets: 'assets'
};

// Function to scan directory and print structure
function scanDirectory(dirPath, baseDir) {
  const result = [];
  function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walk(filePath);
      } else {
        result.push(path.relative(baseDir, filePath));
      }
    });
  }
  walk(dirPath);
  return result;
}

// Function to log file structure
function logFileStructure() {
  Object.keys(directories).forEach(key => {
    const dirPath = path.resolve(__dirname, directories[key]);
    const files = scanDirectory(dirPath, __dirname);
    console.log(`\n${key.toUpperCase()} Files:`);
    files.forEach(file => console.log(file));
  });
}

// Execute function to log the file structure
logFileStructure();
