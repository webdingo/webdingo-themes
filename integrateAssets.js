const fs = require('fs');
const path = require('path');
const sass = require('sass');

const assetsDir = path.join(__dirname, 'assets');
const componentsDir = path.join(__dirname, 'src/components');

// Function to move and rename JS files
function integrateJSFiles() {
  const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js') && !file.startsWith('component-'));

  jsFiles.forEach(file => {
    const componentName = file.replace(/\.js$/, '');
    const componentDir = path.join(componentsDir, componentName);

    if (fs.existsSync(componentDir)) {
      const destFile = path.join(componentDir, `${componentName}.js`);
      fs.renameSync(path.join(assetsDir, file), destFile);
      console.log(`Moved ${file} to ${destFile}`);
    }
  });
}

// Function to convert CSS to SCSS and move files
function integrateCSSFiles() {
  const cssFiles = fs.readdirSync(assetsDir).filter(file => file.startsWith('component-') && file.endsWith('.css'));

  cssFiles.forEach(file => {
    const componentName = file.replace(/^component-/, '').replace(/\.css$/, '');
    const componentDir = path.join(componentsDir, componentName);

    if (fs.existsSync(componentDir)) {
      const cssFilePath = path.join(assetsDir, file);
      const cssContent = fs.readFileSync(cssFilePath, 'utf8');
      const scssContent = cssContent;  // No need to replace .css with .scss in content
      const scssFilePath = path.join(componentDir, `${componentName}.scss`);

      fs.writeFileSync(scssFilePath, scssContent);
      fs.unlinkSync(cssFilePath);
      console.log(`Converted ${file} to ${scssFilePath}`);
    }
  });
}

// Run integration functions
integrateJSFiles();
integrateCSSFiles();

console.log('Assets integration completed.');
