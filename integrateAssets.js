const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const scssSyntax = require('postcss-scss');
const prettier = require('prettier');

const assetsDir = path.join(__dirname, 'assets');
const componentsDir = path.join(__dirname, 'src/components');

// Function to ensure component directory exists
function ensureComponentDir(componentName) {
  const componentDir = path.join(componentsDir, componentName);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
    console.log(`Created directory ${componentDir}`);
  }
  return componentDir;
}

// Function to delete files if no matching asset file exists
function deleteUnmatchedFiles(componentName, jsExists, scssExists) {
  const componentDir = path.join(componentsDir, componentName);
  if (fs.existsSync(componentDir)) {
    const files = fs.readdirSync(componentDir);
    files.forEach(file => {
      const filePath = path.join(componentDir, file);
      if (file.endsWith('.js') && !jsExists) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${filePath}`);
      } else if (file.endsWith('.scss') && !scssExists) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${filePath}`);
      }
    });
  }
}

// Function to copy and rename JS files
function integrateJSFiles() {
  const jsFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js') && !file.startsWith('component-'));
  const jsFileNames = new Set();

  jsFiles.forEach(file => {
    const componentName = file.replace(/\.js$/, '');
    const componentDir = ensureComponentDir(componentName);
    const destFile = path.join(componentDir, `${componentName}.js`);

    fs.copyFileSync(path.join(assetsDir, file), destFile);
    console.log(`Copied ${file} to ${destFile}`);
    jsFileNames.add(componentName);
  });

  return jsFileNames;
}

// Function to convert CSS to nested SCSS and copy files
async function integrateCSSFiles() {
  const cssFiles = fs.readdirSync(assetsDir).filter(file => file.startsWith('component-') && file.endsWith('.css'));
  const scssFileNames = new Set();

  for (const file of cssFiles) {
    const componentName = file.replace(/^component-/, '').replace(/\.css$/, '');
    const componentDir = ensureComponentDir(componentName);
    const cssFilePath = path.join(assetsDir, file);
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');

    try {
      // Use PostCSS to parse and format the CSS into SCSS
      const result = await postcss().process(cssContent, { syntax: scssSyntax });
      const formattedScss = prettier.format(result.css, { parser: 'scss' });

      const scssFilePath = path.join(componentDir, `${componentName}.scss`);
      fs.writeFileSync(scssFilePath, formattedScss);
      console.log(`Converted and copied ${file} to ${scssFilePath}`);
      scssFileNames.add(componentName);
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  return scssFileNames;
}

// Run integration functions
(async () => {
  const jsFileNames = integrateJSFiles();
  const scssFileNames = await integrateCSSFiles();

  // Get all component directories
  const componentDirs = fs.readdirSync(componentsDir);

  componentDirs.forEach(componentName => {
    const jsExists = jsFileNames.has(componentName);
    const scssExists = scssFileNames.has(componentName);
    deleteUnmatchedFiles(componentName, jsExists, scssExists);
  });

  console.log('Assets integration completed.');
})();
