const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src/components');

fs.readdir(baseDir, (err, folders) => {
  if (err) {
    console.error(`Failed to read directory ${baseDir}:`, err);
    return;
  }

  folders.forEach((folder) => {
    const componentDir = path.join(baseDir, folder);

    if (fs.lstatSync(componentDir).isDirectory()) {
      const scssFile = path.join(componentDir, `${folder}.scss`);
      const jsFile = path.join(componentDir, `${folder}.js`);

      if (!fs.existsSync(scssFile)) {
        fs.writeFileSync(scssFile, `/* Styles for ${folder} component */\n.${folder} {\n  // Add styles here\n}\n`);
      }

      if (!fs.existsSync(jsFile)) {
        fs.writeFileSync(jsFile, `// Scripts for ${folder} component\nconsole.log('${folder} component loaded');\n`);
      }
    }
  });

  console.log('Component files generated successfully.');
});
