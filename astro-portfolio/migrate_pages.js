import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('..');
const pagesDir = path.resolve('./src/pages');

const filesToMigrate = [
    'project-caller-id.html',
    'project-iptables.html',
    'project-proxmox-backup.html',
    'project-proxmox-expansion.html',
    'project-monitoring-stack.html'
];

for (const file of filesToMigrate) {
    const htmlPath = path.join(rootDir, file);
    if (!fs.existsSync(htmlPath)) {
        console.warn(`File ${file} not found.`);
        continue;
    }

    const content = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract title
    const titleMatch = content.match(/<h1 class="section-title reveal">(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : 'Project Details';
    
    // Extract the main content div
    const contentStartTag = '<div class="project-page-content reveal">';
    const contentStartIndex = content.indexOf(contentStartTag);
    if (contentStartIndex === -1) {
        console.warn(`Content not found in ${file}.`);
        continue;
    }
    
    // We want everything from contentStartTag to the closing section tag.
    // That means we find the start index, and then find the ending `</section>`
    const sectionEndTag = '</section>';
    const sectionEndIndex = content.indexOf(sectionEndTag, contentStartIndex);
    
    // But we need to exclude the closing `</div></div>` that is after the project-page-content
    // A simpler way: just take substring from contentStartIndex to `</section>`, and remove last `</div></div>` which was closing container/section.
    let extractedHTML = content.substring(contentStartIndex, sectionEndIndex);
    
    // Remove the two closing divs at the end which belonged to container and section
    extractedHTML = extractedHTML.replace(/<\/div>\s*<\/div>\s*$/, '');
    
    // Swap "class=" to "class=" where appropriate. They are raw HTML strings, so Astro will accept them.
    // Let's create the Astro file contents.
    const astroFilename = file.replace('.html', '.astro');
    
    const astroCode = `---
import ProjectLayout from '../layouts/ProjectLayout.astro';
---

<ProjectLayout title="${title}">
${extractedHTML}
</ProjectLayout>
`;

    fs.writeFileSync(path.join(pagesDir, astroFilename), astroCode);
    console.log(`Migrated ${file} -> ${astroFilename}`);
}
