const fs = require('fs-extra');
const path = require('path');

// Configuration
const config = {
  cssDir: './assets/css',
  jsDir: './assets/js',
  htmlPath: './index.html'
};

// Function to extract priority from JS file
async function getJsPriority(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const firstLine = content.split('\n')[0].trim();
    
    // Check if first line contains priority comment
    const priorityMatch = firstLine.match(/\/\/\s*Priority:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (priorityMatch) {
      return parseFloat(priorityMatch[1]);
    }
  } catch (error) {
    console.warn(`Could not read priority from ${filePath}:`, error.message);
  }
  
  // Default priority if not found or error
  return 0;
}

// Function to sort JS files by priority
async function sortJsFilesByPriority(jsFiles) {
  const filesWithPriority = [];
  
  for (const file of jsFiles) {
    const priority = await getJsPriority(file);
    filesWithPriority.push({ file, priority });
  }
  
  // Sort by priority (higher priority first), then by filename for consistency
  filesWithPriority.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return a.file.localeCompare(b.file); // Alphabetical order for same priority
  });
  
  // Log the sorting order
  console.log('JS files development order:');
  filesWithPriority.forEach(({ file, priority }) => {
    console.log(`  Priority ${priority}: ${path.basename(file)}`);
  });
  
  return filesWithPriority.map(item => item.file);
}

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
    
    // Sort JS files by priority
    const sortedJsFiles = await sortJsFilesByPriority(filteredJsFiles);
    
    console.log('Found CSS files:', filteredCssFiles);
    console.log('Found JS files (sorted by priority):', sortedJsFiles);

    // Update HTML file for development (using sorted JS files)
    if (await fs.pathExists(config.htmlPath)) {
      await updateHtmlForDev(filteredCssFiles, sortedJsFiles);
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

  // Uncomment individual CSS files (CSS files don't need priority sorting)
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

  // Remove all existing individual JS script tags first to avoid duplicates when re-adding in priority order
  const allJsFiles = jsFiles.map(file => {
    const relativePath = path.relative('.', file).replace(/\\/g, '/');
    return relativePath.replace('./', '');
  });

  // Remove commented and active JS script tags for all JS files
  for (const cleanPath of allJsFiles) {
    // Remove commented JS tags
    const commentedJsRegex = new RegExp(
      `<!--\\s*<script\\s+src="\\.\\/${cleanPath}"[^>]*><\\/script>\\s*-->\\s*`,
      'gi'
    );
    htmlContent = htmlContent.replace(commentedJsRegex, '');
    
    // Remove active JS tags  
    const activeJsRegex = new RegExp(
      `<script\\s+src="\\.\\/${cleanPath}"[^>]*><\\/script>\\s*`,
      'gi'
    );
    htmlContent = htmlContent.replace(activeJsRegex, '');
    modified = true;
  }

  // Add JS files back in priority order
  for (const jsFile of jsFiles) {
    const relativePath = path.relative('.', jsFile).replace(/\\/g, '/');
    const cleanPath = relativePath.replace('./', '');
    
    // Add JS file before closing body tag
    const bodyCloseIndex = htmlContent.lastIndexOf('</body>');
    if (bodyCloseIndex !== -1) {
      const jsScript = `  <script src="./${cleanPath}"></script>\n`;
      htmlContent = htmlContent.slice(0, bodyCloseIndex) + 
                   jsScript + 
                   htmlContent.slice(bodyCloseIndex);
      console.log(`Added JS file in priority order: ${cleanPath}`);
      modified = true;
    }
  }

  if (modified) {
    await fs.writeFile(config.htmlPath, htmlContent);
    console.log('✅ HTML updated for development mode with priority-sorted JS files!');
  } else {
    console.log('HTML already in development mode - no changes needed');
  }
}

// Run the dev setup
dev();