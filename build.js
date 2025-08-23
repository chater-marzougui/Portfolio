const fs = require('fs-extra');
const path = require('path');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

// Configuration
const config = {
  cssDir: './assets/css',
  jsDir: './assets/js',
  output: {
    css: './assets/css/bundle.min.css',
    js: './assets/js/bundle.min.js'
  },
  htmlPath: './index.html'
};

// Function to scan directory for files with specific extensions
async function scanDirectory(dir, extensions) {
  const files = [];
  try {
    const items = await fs.readdir(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = await fs.stat(itemPath);
      if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(itemPath);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}:`, error.message);
  }
  return files.sort(); // Sort for consistent order
}

async function build() {
  try {
    // Scan for CSS and JS files
    const cssFiles = await scanDirectory(config.cssDir, ['.css']);
    const jsFiles = await scanDirectory(config.jsDir, ['.js']);
    
    // Filter out the bundle files themselves to avoid circular bundling
    const filteredCssFiles = cssFiles.filter(file => !file.includes('bundle.min.css'));
    const filteredJsFiles = jsFiles.filter(file => !file.includes('bundle.min.js'));
    
    console.log('Found CSS files:', filteredCssFiles);
    console.log('Found JS files:', filteredJsFiles);

    // Bundle and minify CSS
    if (filteredCssFiles.length > 0) {
      let cssContent = '';
      for (const file of filteredCssFiles) {
        const content = await fs.readFile(file, 'utf8');
        cssContent += `/* ${file} */\n${content}\n\n`;
      }
      const minifiedCSS = new CleanCSS({}).minify(cssContent).styles;
      await fs.outputFile(config.output.css, minifiedCSS);
      console.log('CSS bundled and minified successfully!');
    } else {
      console.log('No CSS files found to bundle');
    }

    // Bundle and minify JS
    if (filteredJsFiles.length > 0) {
      let jsContent = '';
      for (const file of filteredJsFiles) {
        const content = await fs.readFile(file, 'utf8');
        jsContent += `/* ${file} */\n${content}\n\n`;
      }
      const minifiedJS = (await minify(jsContent)).code;
      await fs.outputFile(config.output.js, minifiedJS);
      console.log('JS bundled and minified successfully!');
    } else {
      console.log('No JS files found to bundle');
    }

    // Update HTML file
    if (await fs.pathExists(config.htmlPath)) {
      await updateHtmlFile(filteredCssFiles, filteredJsFiles);
    } else {
      console.warn(`HTML file not found at ${config.htmlPath}`);
    }
    
  } catch (error) {
    console.error('Build error:', error);
    process.exit(1);
  }
}

async function updateHtmlFile(cssFiles, jsFiles) {
  let htmlContent = await fs.readFile(config.htmlPath, 'utf8');
  let modified = false;

  // Comment out CSS files
  for (const cssFile of cssFiles) {
    const relativePath = path.relative('.', cssFile).replace(/\\/g, '/');
    const cssLinkRegex = new RegExp(
      `<link\\s+rel="stylesheet"\\s+href="\\.\/${relativePath.replace('./', '')}"\\s*\\/?>`,
      'gi'
    );
    
    if (cssLinkRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(cssLinkRegex, (match) => {
        console.log(`Commenting out CSS: ${match}`);
        return `<!-- ${match} -->`;
      });
      modified = true;
    }
  }

  // Comment out JS files
  for (const jsFile of jsFiles) {
    const relativePath = path.relative('.', jsFile).replace(/\\/g, '/');
    const jsScriptRegex = new RegExp(
      `<script\\s+src="\\.\/${relativePath.replace('./', '')}"[^>]*><\\/script>`,
      'gi'
    );
    
    if (jsScriptRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(jsScriptRegex, (match) => {
        console.log(`Commenting out JS: ${match}`);
        return `<!-- ${match} -->`;
      });
      modified = true;
    }
  }

  // Add bundled CSS if not already present
  if (cssFiles.length > 0 && !htmlContent.includes('bundle.min.css')) {
    const headCloseIndex = htmlContent.indexOf('</head>');
    if (headCloseIndex !== -1) {
      const bundleCssLink = '  <link rel="stylesheet" href="./assets/css/bundle.min.css" />\n';
      htmlContent = htmlContent.slice(0, headCloseIndex) + 
                   bundleCssLink + 
                   htmlContent.slice(headCloseIndex);
      console.log('Added bundled CSS link');
      modified = true;
    }
  }

  // Add bundled JS if not already present
  if (jsFiles.length > 0 && !htmlContent.includes('bundle.min.js')) {
    const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      const bundleJsScript = '  <script src="./assets/js/bundle.min.js"></script>\n';
      htmlContent = htmlContent.slice(0, bodyCloseIndex) + 
                   bundleJsScript + 
                   htmlContent.slice(bodyCloseIndex);
      console.log('Added bundled JS script');
      modified = true;
    } else {
      // If no closing body tag, add at the end
      htmlContent += '<script src="./assets/js/bundle.min.js"></script>\n';
      console.log('Added bundled JS script at end of file');
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(config.htmlPath, htmlContent);
    console.log('HTML updated successfully!');
  } else {
    console.log('No HTML modifications needed');
  }
}

// Run the build
build();