const fs = require('fs-extra');
const path = require('path');

// Configuration
const config = {
  cssDir: './assets/css',
  jsDir: './assets/js',
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

async function dev() {
  try {
    // Scan for CSS and JS files
    const cssFiles = await scanDirectory(config.cssDir, ['.css']);
    const jsFiles = await scanDirectory(config.jsDir, ['.js']);
    
    // Filter out the bundle files
    const filteredCssFiles = cssFiles.filter(file => !file.includes('bundle.min.css'));
    const filteredJsFiles = jsFiles.filter(file => !file.includes('bundle.min.js'));
    
    console.log('Found CSS files:', filteredCssFiles);
    console.log('Found JS files:', filteredJsFiles);

    // Update HTML file for development
    if (await fs.pathExists(config.htmlPath)) {
      await updateHtmlForDev(filteredCssFiles, filteredJsFiles);
    } else {
      console.warn(`HTML file not found at ${config.htmlPath}`);
    }
    
    console.log('🚀 Development mode enabled!');
    
  } catch (error) {
    console.error('Dev setup error:', error);
    process.exit(1);
  }
}

async function updateHtmlForDev(cssFiles, jsFiles) {
  let htmlContent = await fs.readFile(config.htmlPath, 'utf8');
  let modified = false;

  // Comment out bundle CSS if it exists and is active
  const bundleCssCommentedRegex = /<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/i;
  const hasCommentedBundleCss = bundleCssCommentedRegex.test(htmlContent);
  
  let htmlWithoutComments = htmlContent;
  if (hasCommentedBundleCss) {
    htmlWithoutComments = htmlContent.replace(/<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/gi, '');
  }
  const bundleCssActiveRegex = /<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>/i;
  const hasActiveBundleCss = bundleCssActiveRegex.test(htmlWithoutComments);

  if (hasActiveBundleCss && !hasCommentedBundleCss) {
    // Comment out active bundle CSS
    htmlContent = htmlContent.replace(bundleCssActiveRegex, (match) => {
      console.log(`Commenting out bundle CSS: ${match}`);
      return `<!-- ${match} -->`;
    });
    modified = true;
  }

  // Comment out bundle JS if it exists and is active
  const bundleJsCommentedRegex = /<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/i;
  const hasCommentedBundleJs = bundleJsCommentedRegex.test(htmlContent);
  
  htmlWithoutComments = htmlContent;
  if (hasCommentedBundleJs) {
    htmlWithoutComments = htmlContent.replace(/<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/gi, '');
  }
  const bundleJsActiveRegex = /<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>/i;
  const hasActiveBundleJs = bundleJsActiveRegex.test(htmlWithoutComments);

  if (hasActiveBundleJs && !hasCommentedBundleJs) {
    // Comment out active bundle JS
    htmlContent = htmlContent.replace(bundleJsActiveRegex, (match) => {
      console.log(`Commenting out bundle JS: ${match}`);
      return `<!-- ${match} -->`;
    });
    modified = true;
  }

  // Uncomment individual CSS files
  for (const cssFile of cssFiles) {
    const relativePath = path.relative('.', cssFile).replace(/\\/g, '/');
    const cleanPath = relativePath.replace('./', '');
    
    const commentedCssRegex = new RegExp(
      `<!--\\s*(<link\\s+rel="stylesheet"\\s+href="\\.\\/${cleanPath}"\\s*\\/?>)\\s*-->`,
      'gi'
    );
    
    if (commentedCssRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(commentedCssRegex, (match, linkTag) => {
        console.log(`Uncommenting CSS: ${linkTag}`);
        return linkTag;
      });
      modified = true;
    } else {
      // Check if the CSS file is not referenced at all, add it
      const activeCssRegex = new RegExp(`<link\\s+rel="stylesheet"\\s+href="\\.\\/${cleanPath}"\\s*\\/?>`, 'i');
      if (!activeCssRegex.test(htmlContent)) {
        // Add CSS file to head
        const headCloseIndex = htmlContent.indexOf('</head>');
        if (headCloseIndex !== -1) {
          const cssLink = `  <link rel="stylesheet" href="./${cleanPath}" />\n`;
          htmlContent = htmlContent.slice(0, headCloseIndex) + 
                       cssLink + 
                       htmlContent.slice(headCloseIndex);
          console.log(`Added CSS file: ${cleanPath}`);
          modified = true;
        }
      }
    }
  }

  // Uncomment individual JS files
  for (const jsFile of jsFiles) {
    const relativePath = path.relative('.', jsFile).replace(/\\/g, '/');
    const cleanPath = relativePath.replace('./', '');
    
    const commentedJsRegex = new RegExp(
      `<!--\\s*(<script\\s+src="\\.\\/${cleanPath}"[^>]*><\\/script>)\\s*-->`,
      'gi'
    );
    
    if (commentedJsRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(commentedJsRegex, (match, scriptTag) => {
        console.log(`Uncommenting JS: ${scriptTag}`);
        return scriptTag;
      });
      modified = true;
    } else {
      // Check if the JS file is not referenced at all, add it
      const activeJsRegex = new RegExp(`<script\\s+src="\\.\\/${cleanPath}"[^>]*><\\/script>`, 'i');
      if (!activeJsRegex.test(htmlContent)) {
        // Add JS file before closing body tag
        const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
        if (bodyCloseIndex !== -1) {
          const jsScript = `  <script src="./${cleanPath}"></script>\n`;
          htmlContent = htmlContent.slice(0, bodyCloseIndex) + 
                       jsScript + 
                       htmlContent.slice(bodyCloseIndex);
          console.log(`Added JS file: ${cleanPath}`);
          modified = true;
        }
      }
    }
  }

  if (modified) {
    await fs.writeFile(config.htmlPath, htmlContent);
    console.log('HTML updated for development mode!');
  } else {
    console.log('HTML already in development mode - no changes needed');
  }
}

// Run the dev setup
dev();