const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const scssSyntax = require('postcss-scss');
const prettier = require('prettier');

// Directories
const assetsDir = path.join(__dirname, 'assets');
const componentsDir = path.join(__dirname, 'src/components');
const sectionsDir = path.join(__dirname, 'src/sections');
const templatesDir = path.join(__dirname, 'src/templates');
const globalDir = path.join(__dirname, 'src/global');
const baseDir = path.join(globalDir, 'base');
const utilsDir = path.join(globalDir, 'utils');
const globalAssetsDir = path.join(globalDir, 'assets');

// Ensure a directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory ${dir}`);
  }
  return dir;
}

// Process base.css and global.js files
function processBaseAndGlobalFiles() {
  const files = fs.readdirSync(assetsDir);
  const processedFiles = new Set();

  files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    const fileExtension = path.extname(file).toLowerCase();
    const fileName = path.basename(file, fileExtension);

    if (file === 'base.css') {
      ensureDir(baseDir);
      const destFile = path.join(baseDir, file);
      fs.copyFileSync(filePath, destFile);
      console.log(`Moved ${file} to ${destFile}`);
      processedFiles.add(file);
    } else if (file === 'global.js') {
      ensureDir(baseDir);
      const destFile = path.join(baseDir, file);
      fs.copyFileSync(filePath, destFile);
      console.log(`Moved ${file} to ${destFile}`);
      processedFiles.add(file);
    }
  });

  return processedFiles;
}

// Process templates
async function processTemplates(processedFiles) {
  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    if (processedFiles.has(file)) continue;

    const filePath = path.join(assetsDir, file);
    const fileExtension = path.extname(file).toLowerCase();
    const fileName = path.basename(file, fileExtension);

    if (file.startsWith('template-')) {
      const templateName = file.replace(/^template-/, '').replace(fileExtension, '');
      const targetDir = path.join(templatesDir, templateName);
      ensureDir(targetDir);

      if (fileExtension === '.css') {
        // Convert CSS to SCSS
        const cssContent = fs.readFileSync(filePath, 'utf8');
        try {
          const result = await postcss().process(cssContent, { syntax: scssSyntax });
          const formattedScss = prettier.format(result.css, { parser: 'scss' });
          const scssFilePath = path.join(targetDir, `${templateName}.scss`);
          fs.writeFileSync(scssFilePath, formattedScss);
          console.log(`Converted and copied ${file} to ${scssFilePath}`);
          processedFiles.add(file);
        } catch (err) {
          console.error(`Error processing ${file}:`, err);
        }
      } else if (fileExtension === '.js') {
        // Process JS
        const matchingJSFile = `${templateName}.js`;
        if (fs.existsSync(path.join(assetsDir, matchingJSFile))) {
          const jsFilePath = path.join(assetsDir, matchingJSFile);
          const destJSFile = path.join(targetDir, matchingJSFile);
          fs.copyFileSync(jsFilePath, destJSFile);
          console.log(`Copied ${matchingJSFile} to ${destJSFile}`);
          processedFiles.add(matchingJSFile);
        }
      }
    }
  }
}

// Process components and sections
async function processComponentsAndSections(processedFiles) {
  const files = fs.readdirSync(assetsDir);

  for (const file of files) {
    if (processedFiles.has(file)) continue;

    const filePath = path.join(assetsDir, file);
    const fileExtension = path.extname(file).toLowerCase();
    const fileName = path.basename(file, fileExtension);

    if (fileExtension === '.css' || fileExtension === '.js') {
      if (file.startsWith('component-')) {
        const componentName = file.replace(/^component-/, '').replace(fileExtension, '');
        const targetDir = path.join(componentsDir, componentName);
        ensureDir(targetDir);

        // Process CSS
        if (fileExtension === '.css') {
          const cssContent = fs.readFileSync(filePath, 'utf8');
          try {
            const result = await postcss().process(cssContent, { syntax: scssSyntax });
            const formattedScss = prettier.format(result.css, { parser: 'scss' });
            const scssFilePath = path.join(targetDir, `${componentName}.scss`);
            fs.writeFileSync(scssFilePath, formattedScss);
            console.log(`Converted and copied ${file} to ${scssFilePath}`);
            processedFiles.add(file);
          } catch (err) {
            console.error(`Error processing ${file}:`, err);
          }
        }

        // Process matching JS
        const matchingJSFile = `${componentName}.js`;
        if (fs.existsSync(path.join(assetsDir, matchingJSFile))) {
          const jsFilePath = path.join(assetsDir, matchingJSFile);
          const destJSFile = path.join(targetDir, matchingJSFile);
          fs.copyFileSync(jsFilePath, destJSFile);
          console.log(`Copied ${matchingJSFile} to ${destJSFile}`);
          processedFiles.add(matchingJSFile);
        }

      } else if (file.startsWith('section-')) {
        const sectionName = file.replace(/^section-/, '').replace(fileExtension, '');
        const targetDir = path.join(sectionsDir, sectionName);
        ensureDir(targetDir);

        // Process CSS
        if (fileExtension === '.css') {
          const cssContent = fs.readFileSync(filePath, 'utf8');
          try {
            const result = await postcss().process(cssContent, { syntax: scssSyntax });
            const formattedScss = prettier.format(result.css, { parser: 'scss' });
            const scssFilePath = path.join(targetDir, `${sectionName}.scss`);
            fs.writeFileSync(scssFilePath, formattedScss);
            console.log(`Converted and copied ${file} to ${scssFilePath}`);
            processedFiles.add(file);
          } catch (err) {
            console.error(`Error processing ${file}:`, err);
          }
        }

        // Process matching JS
        const matchingJSFile = `${sectionName}.js`;
        if (fs.existsSync(path.join(assetsDir, matchingJSFile))) {
          const jsFilePath = path.join(assetsDir, matchingJSFile);
          const destJSFile = path.join(targetDir, matchingJSFile);
          fs.copyFileSync(jsFilePath, destJSFile);
          console.log(`Copied ${matchingJSFile} to ${destJSFile}`);
          processedFiles.add(matchingJSFile);
        }
      }
    }
  }
}

// Process remaining files into utils or global/assets
function processRemainingFiles(processedFiles) {
  const files = fs.readdirSync(assetsDir);

  files.forEach(file => {
    if (!processedFiles.has(file)) {
      const filePath = path.join(assetsDir, file);
      const fileExtension = path.extname(file).toLowerCase();
      const fileName = path.basename(file, fileExtension);

      if (fileExtension === '.css' || fileExtension === '.js') {
        // Check if it's a component, section, or template match
        const isComponentMatch = fs.existsSync(path.join(componentsDir, fileName));
        const isSectionMatch = fs.existsSync(path.join(sectionsDir, fileName));
        const isTemplateMatch = fs.existsSync(path.join(templatesDir, fileName));

        // Move to utils if not a match
        if (!isComponentMatch && !isSectionMatch && !isTemplateMatch) {
          ensureDir(utilsDir);
          const subDir = getUtilsSubDir(fileName);
          ensureDir(subDir);
          const destFile = path.join(subDir, file);
          fs.copyFileSync(filePath, destFile);
          console.log(`Moved ${file} to ${destFile}`);
        } else {
          // Move to global/assets if it's not CSS/JS
          ensureDir(globalAssetsDir);
          const destFile = path.join(globalAssetsDir, file);
          fs.copyFileSync(filePath, destFile);
          console.log(`Moved ${file} to ${destFile}`);
        }
      } else {
        // Handle non-CSS/JS files
        ensureDir(globalAssetsDir);
        const destFile = path.join(globalAssetsDir, file);
        fs.copyFileSync(filePath, destFile);
        console.log(`Moved ${file} to ${destFile}`);
      }
    }
  });
}

// Get the utils subdirectory based on file name
function getUtilsSubDir(fileName) {
  const subDir = path.join(utilsDir, fileName);
  ensureDir(subDir);
  return subDir;
}

// Main execution
(async () => {
  try {
    // Process base and global files first
    const processedFiles = processBaseAndGlobalFiles();

    // Process templates next
    await processTemplates(processedFiles);

    // Process components and sections
    await processComponentsAndSections(processedFiles);

    // Process remaining files into utils or global/assets
    processRemainingFiles(processedFiles);

    console.log('Assets integration completed.');
  } catch (err) {
    console.error('Error during assets integration:', err);
  }
})();
