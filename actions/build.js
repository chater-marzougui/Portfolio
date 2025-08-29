const fs = require("fs-extra");
const path = require("path");
const CleanCSS = require("clean-css");
const { minify } = require("terser");

// Configuration
const config = {
  cssDir: "./assets/css",
  jsDir: "./assets/js",
  output: {
    css: "./assets/css/bundle.min.css",
    js: "./assets/js/bundle.min.js",
  },
  htmlPath: "./index.html",
};

// Function to extract priority from JS file
async function getJsPriority(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const firstLine = content.split("\n")[0].trim();

    // Check if first line contains priority comment
    const priorityMatch = firstLine.match(
      /\/\/\s*Priority:\s*([0-9]+(?:\.[0-9]+)?)/i
    );
    if (priorityMatch) {
      return parseFloat(priorityMatch[1]);
    }
  } catch (error) {
    console.warn(`Could not read priority from ${filePath}:`, error.message);
  }

  // Default priority if not found or error
  return 0;
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

  return filesWithPriority.map((item) => item.file);
}

async function build() {
  try {
    let shouldWriteJs = true;
    let shouldWriteCss = true;

    // Scan for CSS and JS files
    const cssFiles = await scanDirectory(config.cssDir, [".css"]);
    const jsFiles = await scanDirectory(config.jsDir, [".js"]);

    // Filter out the bundle files themselves to avoid circular bundling
    const filteredCssFiles = cssFiles.filter(
      (file) => !file.includes("bundle.min.css")
    );
    const filteredJsFiles = jsFiles.filter(
      (file) => !file.includes("bundle.min.js")
    );

    // Sort JS files by priority
    const sortedJsFiles = await sortJsFilesByPriority(filteredJsFiles);

    // Bundle and minify CSS
    if (filteredCssFiles.length > 0) {
      let cssContent = "";
      for (const file of filteredCssFiles) {
        const content = await fs.readFile(file, "utf8");
        cssContent += `/* ${file} */\n${content}\n\n`;
      }
      const minifiedCSS = new CleanCSS({}).minify(cssContent).styles;

      // Check if output file already exists and is the same
      if (await fs.pathExists(config.output.css)) {
        const existingContent = await fs.readFile(config.output.css, "utf8");
        if (existingContent === minifiedCSS) {
          console.log("⚠️  CSS bundle is already up to date.");
          shouldWriteCss = false;
        }
      }
      if (shouldWriteCss) {
        await fs.outputFile(config.output.css, minifiedCSS);
        console.log("✅ CSS bundled and minified.");
      }
    } else {
      console.log("No CSS files found to bundle");
    }

    // Bundle and minify JS (using sorted files)
    if (sortedJsFiles.length > 0) {
      let jsContent = "";
      for (const file of sortedJsFiles) {
        const content = await fs.readFile(file, "utf8");
        jsContent += `/* ${file} */\n${content}\n\n`;
      }
      const minifiedJS = (await minify(jsContent)).code;

      // Check if output file already exists and is the same
      if (await fs.pathExists(config.output.js)) {
        const existingContent = await fs.readFile(config.output.js, "utf8");
        if (existingContent === minifiedJS) {
          console.log("⚠️  JS bundle is already up to date.");
          shouldWriteJs = false;
        }
      }
      if (shouldWriteJs) {
        await fs.outputFile(config.output.js, minifiedJS);
        console.log("✅ JS bundled and minified.");
      }
    } else {
      console.log("No JS files found to bundle");
    }

    // Update HTML file (pass sorted JS files)
    if (await fs.pathExists(config.htmlPath)) {
      modified = await updateHtmlFile(filteredCssFiles, sortedJsFiles);
    } else {
      console.warn(`HTML file not found at ${config.htmlPath}`);
      return;
    }

    if (modified || shouldWriteCss || shouldWriteJs) {
      console.log("🔨 Build completed.");
    } else {
      console.log("⚠️  No changes detected.");
    }
  } catch (error) {
    console.error("Build error:", error);
    process.exit(1);
  }
}

async function updateHtmlFile(cssFiles, jsFiles) {
  let htmlContent = await fs.readFile(config.htmlPath, "utf8");
  let modified = false;
  let jsCommented = false;
  let cssCommented = false;

  // Comment out CSS files (only if not already commented)
  for (const cssFile of cssFiles) {
    const relativePath = path.relative(".", cssFile).replace(/\\/g, "/");
    const cleanPath = relativePath.replace("./", "");

    // Check if already commented out
    const commentedCssRegex = new RegExp(
      `<!--\\s*<link\\s+rel="stylesheet"\\s+href="\\.\/${cleanPath}"\\s*\\/?>\\s*-->`,
      "gi"
    );

    // Only comment out if not already commented
    if (!commentedCssRegex.test(htmlContent)) {
      const cssLinkRegex = new RegExp(
        `<link\\s+rel="stylesheet"\\s+href="\\.\/${cleanPath}"\\s*\\/?>`,
        "gi"
      );

      if (cssLinkRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(cssLinkRegex, (match) => {
          return `<!-- ${match} -->`;
        });
        cssCommented = true;
        modified = true;
      }
    }
  }

  if (jsCommented) {
    console.log("✅ JS commented.");
  }

  // Comment out JS files (only if not already commented)
  for (const jsFile of jsFiles) {
    const relativePath = path.relative(".", jsFile).replace(/\\/g, "/");
    const cleanPath = relativePath.replace("./", "");

    // Check if already commented out
    const commentedJsRegex = new RegExp(
      `<!--\\s*<script\\s+src="\\.\/${cleanPath}"[^>]*><\\/script>\\s*-->`,
      "gi"
    );

    // Only comment out if not already commented
    if (!commentedJsRegex.test(htmlContent)) {
      const jsScriptRegex = new RegExp(
        `<script\\s+src="\\.\/${cleanPath}"[^>]*><\\/script>`,
        "gi"
      );

      if (jsScriptRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(jsScriptRegex, (match) => {
          return `<!-- ${match} -->`;
        });
        jsCommented = true;
        modified = true;
      }
    }
  }

  if (cssCommented) {
    console.log("✅ CSS commented.");
  }

  // Handle bundled CSS
  if (cssFiles.length > 0) {
    // First check for commented bundle CSS
    const bundleCssCommentedRegex =
      /<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/i;
    const hasCommentedBundleCss = bundleCssCommentedRegex.test(htmlContent);

    // Then check for active bundle CSS, but exclude the commented ones
    let htmlWithoutComments = htmlContent;
    if (hasCommentedBundleCss) {
      htmlWithoutComments = htmlContent.replace(
        /<!--\s*<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>\s*-->/gi,
        ""
      );
    }
    const bundleCssActiveRegex =
      /<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>/i;
    const hasActiveBundleCss = bundleCssActiveRegex.test(htmlWithoutComments);

    if (hasCommentedBundleCss && !hasActiveBundleCss) {
      // Uncomment the bundled CSS - use a more flexible regex for replacement
      const flexibleCommentedRegex =
        /<!--\s*(<link\s+rel="stylesheet"\s+href="\.\/assets\/css\/bundle\.min\.css"\s*\/?>)\s*-->/gi;
      htmlContent = htmlContent.replace(
        flexibleCommentedRegex,
        (match, linkTag) => {
          return linkTag;
        }
      );
      modified = true;
    } else if (!hasActiveBundleCss && !hasCommentedBundleCss) {
      // Add bundled CSS if not present at all
      const headCloseIndex = htmlContent.indexOf("</head>");
      if (headCloseIndex !== -1) {
        const bundleCssLink =
          '  <link rel="stylesheet" href="./assets/css/bundle.min.css" />\n';
        htmlContent =
          htmlContent.slice(0, headCloseIndex) +
          bundleCssLink +
          htmlContent.slice(headCloseIndex);
        console.log("Added bundled CSS link");
        modified = true;
      }
    }
  }

  // Handle bundled JS
  if (jsFiles.length > 0) {
    // First check for commented bundle JS
    const bundleJsCommentedRegex =
      /<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/i;
    const hasCommentedBundleJs = bundleJsCommentedRegex.test(htmlContent);

    // Then check for active bundle JS, but exclude the commented ones
    let htmlWithoutComments = htmlContent;
    if (hasCommentedBundleJs) {
      htmlWithoutComments = htmlContent.replace(
        /<!--\s*<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>\s*-->/gi,
        ""
      );
    }
    const bundleJsActiveRegex =
      /<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>/i;
    const hasActiveBundleJs = bundleJsActiveRegex.test(htmlWithoutComments);

    if (hasCommentedBundleJs && !hasActiveBundleJs) {
      // Uncomment the bundled JS - use a more flexible regex for replacement
      const flexibleCommentedRegex =
        /<!--\s*(<script\s+src="\.\/assets\/js\/bundle\.min\.js"[^>]*><\/script>)\s*-->/gi;
      htmlContent = htmlContent.replace(
        flexibleCommentedRegex,
        (match, scriptTag) => {
          return scriptTag;
        }
      );
      modified = true;
    } else if (!hasActiveBundleJs && !hasCommentedBundleJs) {
      // Add bundled JS if not present at all
      const bodyCloseIndex = htmlContent.lastIndexOf("</body>");
      if (bodyCloseIndex !== -1) {
        const bundleJsScript =
          '  <script src="./assets/js/bundle.min.js"></script>\n';
        htmlContent =
          htmlContent.slice(0, bodyCloseIndex) +
          bundleJsScript +
          htmlContent.slice(bodyCloseIndex);
        console.log("Added bundled JS script");
        modified = true;
      } else {
        // If no closing body tag, add at the end
        htmlContent += '<script src="./assets/js/bundle.min.js"></script>\n';
        modified = true;
      }
    }
  }
  if (modified) {
    await fs.writeFile(config.htmlPath, htmlContent);
    console.log("✅ HTML updated.");
  } else {
    console.log("⚠️  No changes needed in HTML file.");
  }

  return modified;
}

// Run the build
build();
