import { defineConfig } from 'vite';
import path from 'path';
import glob from 'glob';

function getInputFiles() {
  const globalFiles = glob.sync('src/global/**/*.js').reduce((acc, file) => {
    const fileName = path.basename(file, path.extname(file));
    acc[fileName] = path.resolve(__dirname, file);
    return acc;
  }, {});

  const componentFiles = glob.sync('src/components/**/*.js').reduce((acc, file) => {
    const fileName = `component-${path.basename(file, path.extname(file))}`;
    acc[fileName] = path.resolve(__dirname, file);
    return acc;
  }, {});

  const sectionFiles = glob.sync('src/sections/**/*.js').reduce((acc, file) => {
    const fileName = `section-${path.basename(file, path.extname(file))}`;
    acc[fileName] = path.resolve(__dirname, file);
    return acc;
  }, {});

  return {
    base: path.resolve(__dirname, 'src/global/base.js'),
    ...globalFiles,
    ...componentFiles,
    ...sectionFiles
  };
}

export default defineConfig({
  build: {
    outDir: 'dist/assets',
    rollupOptions: {
      input: getInputFiles(),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "node_modules/simple.css/dist/simple.min.css";
          @import "src/global/base.scss";
        `
      }
    }
  }
});
