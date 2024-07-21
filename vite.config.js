import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Helper function to generate output file names with appropriate prefixes
const getOutputFileName = (filePath) => {
  const fileName = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);
  
  if (filePath.includes('/sections/')) {
    return `assets/section-${fileName}${ext}`;
  }
  if (filePath.includes('/components/')) {
    return `assets/component-${fileName}${ext}`;
  }
  if (filePath.includes('/templates/')) {
    return `assets/template-${fileName}${ext}`;
  }
  
  // For other files
  return `assets/${fileName}${ext}`;
};

// Function to generate entries for rollupOptions input and asset file names
const generateEntries = (dir, prefix = '') => {
  const entries = {};
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively handle subdirectories
      Object.assign(entries, generateEntries(filePath, `${prefix}${path.basename(file)}/`));
    } else {
      const fileName = `${prefix}${path.basename(file, path.extname(file))}`;
      if (path.extname(file) === '.js' || path.extname(file) === '.scss' || path.extname(file) === '.css') {
        entries[fileName] = filePath;
      }
    }
  });

  return entries;
};

// Generate entries for each directory
const globalEntries = generateEntries(path.resolve(__dirname, 'src/global'));
const componentEntries = generateEntries(path.resolve(__dirname, 'src/components'));
const sectionEntries = generateEntries(path.resolve(__dirname, 'src/sections'));
const templateEntries = generateEntries(path.resolve(__dirname, 'src/templates'));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        ...globalEntries,
        ...componentEntries,
        ...sectionEntries,
        ...templateEntries,
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Use the custom function to determine asset file names
          return getOutputFileName(assetInfo.name);
        },
      },
    },
  },
});
