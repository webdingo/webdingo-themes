const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const scssSyntax = require('postcss-scss');
const prettier = require('prettier');

const assetsDir = path.join(__dirname, 'assets');
const sectionsDir = path.join(__dirname, 'src/sections');

// Function to ensure section directory exists
function ensureSectionDir(sectionName) {
  const sectionDir = path.join(sectionsDir, sectionName);
  if (!fs.existsSync(sectionDir)) {
    fs.mkdirSync(sectionDir, { recursive: true });
    console.log(`Created directory ${sectionDir}`);
  }
  return sectionDir;
}

// Function to delete files if no matching asset file exists
function deleteUnmatchedFiles(sectionName, jsExists, scssExists) {
  const sectionDir = path.join(sectionsDir, sectionName);
  if (fs.existsSync(sectionDir)) {
    const files = fs.readdirSync(sectionDir);
    files.forEach(file => {
      const filePath = path.join(sectionDir, file);
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
  const jsFiles = fs.readdirSync(assetsDir).filter(file => file.startsWith('section-') && file.endsWith('.js'));
  const jsFileNames = new Set();

  jsFiles.forEach(file => {
    const sectionName = file.replace(/^section-/, '').replace(/\.js$/, '');
    const sectionDir = ensureSectionDir(sectionName);
    const destFile = path.join(sectionDir, `${sectionName}.js`);

    fs.copyFileSync(path.join(assetsDir, file), destFile);
    console.log(`Copied ${file} to ${destFile}`);
    jsFileNames.add(sectionName);
  });

  return jsFileNames;
}

// Function to convert CSS to nested SCSS and copy files
async function integrateCSSFiles() {
  const cssFiles = fs.readdirSync(assetsDir).filter(file => file.startsWith('section-') && file.endsWith('.css'));
  const scssFileNames = new Set();

  for (const file of cssFiles) {
    const sectionName = file.replace(/^section-/, '').replace(/\.css$/, '');
    const sectionDir = ensureSectionDir(sectionName);
    const cssFilePath = path.join(assetsDir, file);
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');

    try {
      // Use PostCSS to parse and format the CSS into SCSS
      const result = await postcss().process(cssContent, { syntax: scssSyntax });
      const formattedScss = prettier.format(result.css, { parser: 'scss' });

      const scssFilePath = path.join(sectionDir, `${sectionName}.scss`);
      fs.writeFileSync(scssFilePath, formattedScss);
      console.log(`Converted and copied ${file} to ${scssFilePath}`);
      scssFileNames.add(sectionName);
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

  // Get all section directories
  const sectionDirs = fs.readdirSync(sectionsDir);

  sectionDirs.forEach(sectionName => {
    const jsExists = jsFileNames.has(sectionName);
    const scssExists = scssFileNames.has(sectionName);
    deleteUnmatchedFiles(sectionName, jsExists, scssExists);
  });

  console.log('Sections integration completed.');
})();
