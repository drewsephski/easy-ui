import * as fs from 'fs';
import * as path from 'path';

// Get all directories in the (docs) folder
const docsDir = path.join(process.cwd(), 'app', '(docs)');
const templateDirs = fs.readdirSync(docsDir, { withFileTypes: true })
  .filter((dirent: fs.Dirent) => dirent.isDirectory())
  .map((dirent: fs.Dirent) => dirent.name);

console.log(`Found ${templateDirs.length} directories in (docs) folder`);

// Base directory
const baseDir = path.join(process.cwd(), 'app', '(docs)');

// Function to update the Buy Now button in a template file
function updateBuyNowButton(templateDir: string) {
  const filePath = path.join(baseDir, templateDir, 'page.tsx');
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create template name in title case (e.g., ez-beautiful -> Ez Beautiful)
    const templateName = templateDir
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Pattern to find the Buy Now button
    const buyNowPattern = /<Button[^>]*?onClick={\s*[^}]*?window\.open\([^)]*?\)[^}]*?}[^>]*?>[^<]*?Buy Now[^<]*?<\/Button>/s;
    
    // Replacement with the new Link component
    const replacement = `<Link href="/checkout?template=${encodeURIComponent(templateName)}" className="w-1/2">
            <Button
              className="w-full px-0 py-4 mr-2 group rounded-[0.75rem]"
              type="button"
            >
              Buy Now
            </Button>
          </Link>`;
    
    // Check if the pattern exists in the file
    if (buyNowPattern.test(content)) {
      // Replace the Buy Now button
      const updatedContent = content.replace(buyNowPattern, replacement);
      
      // Ensure Link is imported from next/link
      if (!content.includes("import Link from \"next/link\"")) {
        const importStatement = 'import Link from "next/link"\n';
        const updatedWithImport = importStatement + updatedContent;
        fs.writeFileSync(filePath, updatedWithImport, 'utf8');
        console.log(`✅ Updated Buy Now button in ${templateDir} (added import)`);
      } else {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated Buy Now button in ${templateDir}`);
      }
    } else {
      console.log(`ℹ️  No Buy Now button found in ${templateDir} or already updated`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${templateDir}:`, error);
  }
}

// Process all template directories
console.log('🚀 Starting to update Buy Now buttons...\n');

templateDirs.forEach(dir => {
  updateBuyNowButton(dir);
});

console.log('\n✨ All template pages have been processed!');
