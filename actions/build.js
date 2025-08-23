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

  // Comment out CSS files (only if not already commented)
  for (const cssFile of cssFiles) {
    const relativePath = path.relative('.', cssFile).replace(/\\/g, '/');
    const cleanPath = relativePath.replace('./', '');
    
    // Check if already commented out
    const commentedCssRegex = new RegExp(
      `<!--\\s*<link\\s+rel="stylesheet"\\s+href="\\.\/${cleanPath}"\\s*\\/?>\\s*-->`,
      'gi'
    );
    
    // Only comment out if not already commented
    if (!commentedCssRegex.test(htmlContent)) {
      const cssLinkRegex = new RegExp(
        `<link\\s+rel="stylesheet"\\s+href="\\.\/${cleanPath}"\\s*\\/?>`,
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
  }

  // Comment out JS files (only if not already commented)
  for (const jsFile of jsFiles) {
    const relativePath = path.relative('.', jsFile).replace(/\\/g, '/');
    const cleanPath = relativePath.replace('./', '');
    
    // Check if already commented out
    const commentedJsRegex = new RegExp(
      `<!--\\s*<script\\s+src="\\.\/${cleanPath}"[^>]*><\\/script>\\s*-->`,
      'gi'
    );
    
    // Only comment out if not already commented
    if (!commentedJsRegex.test(htmlContent)) {
      const jsScriptRegex = new RegExp(
        `<script\\s+src="\\.\/${cleanPath}"[^>]*><\\/script>`,
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
  }

  // Handle bundled CSS
  if (cssFiles.length > 0) {
    // First check for commented bundle CSS
    const bundleCssCommentedRegex = /<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/i;
    const hasCommentedBundleCss = bundleCssCommentedRegex.test(htmlContent);
    
    // Then check for active bundle CSS, but exclude the commented ones
    let htmlWithoutComments = htmlContent;
    if (hasCommentedBundleCss) {
      htmlWithoutComments = htmlContent.replace(/<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/gi, '');
    }
    const bundleCssActiveRegex = /<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>/i;
    const hasActiveBundleCss = bundleCssActiveRegex.test(htmlWithoutComments);
    
    if (hasCommentedBundleCss && !hasActiveBundleCss) {
      // Uncomment the bundled CSS - use a more flexible regex for replacement
      const flexibleCommentedRegex = /<!--\s*(<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>)\s*-->/gi;
      htmlContent = htmlContent.replace(flexibleCommentedRegex, (match, linkTag) => {
        return linkTag;
      });
      modified = true;
    } else if (!hasActiveBundleCss && !hasCommentedBundleCss) {
      // Add bundled CSS if not present at all
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
  }

  // Handle bundled JS
  if (jsFiles.length > 0) {
    // First check for commented bundle JS
    const bundleJsCommentedRegex = /<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/i;
    const hasCommentedBundleJs = bundleJsCommentedRegex.test(htmlContent);
    
    // Then check for active bundle JS, but exclude the commented ones
    let htmlWithoutComments = htmlContent;
    if (hasCommentedBundleJs) {
      htmlWithoutComments = htmlContent.replace(/<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/gi, '');
    }
    const bundleJsActiveRegex = /<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>/i;
    const hasActiveBundleJs = bundleJsActiveRegex.test(htmlWithoutComments);
    
    if (hasCommentedBundleJs && !hasActiveBundleJs) {
      // Uncomment the bundled JS - use a more flexible regex for replacement
      const flexibleCommentedRegex = /<!--\s*(<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>)\s*-->/gi;
      htmlContent = htmlContent.replace(flexibleCommentedRegex, (match, scriptTag) => {
        return scriptTag;
      });
      modified = true;
    } else if (!hasActiveBundleJs && !hasCommentedBundleJs) {
      // Add bundled JS if not present at all
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
        modified = true;
      }
    }
  }

  await fs.writeFile(config.htmlPath, htmlContent);
  console.log('✅ HTML updated successfully!');
}

// Run the build
build();