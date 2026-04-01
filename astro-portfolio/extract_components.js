import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('..');
const componentsDir = path.resolve('./src/components');

const indexContent = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Function to extract HTML chunk
function extractChunk(startTag, endTag) {
    const startIdx = indexContent.indexOf(startTag);
    if (startIdx === -1) return '';
    let endIdx = indexContent.indexOf(endTag, startIdx);
    if (endIdx === -1) return '';
    endIdx += endTag.length;
    return indexContent.slice(startIdx, endIdx);
}

const components = {
    'Navbar.astro': extractChunk('<nav id="navbar">', '</nav>'),
    'Hero.astro': extractChunk('<section id="hero" class="hero-section">', '</section>'),
    'About.astro': extractChunk('<section id="about" class="about-section section">', '</section>'),
    'Projects.astro': extractChunk('<section id="projects" class="projects-section section">', '</section>'),
    'Contact.astro': extractChunk('<section id="contact" class="contact-section section">', '</section>'),
    'Footer.astro': extractChunk('<footer>', '</footer>')
};

for (const [filename, html] of Object.entries(components)) {
    if(!html) {
		console.warn(`Could not extract ${filename}. Check tags.`);
		continue;
	}
	// Prepend frontmatter --- ---
    const content = `---\n// ${filename}\n---\n\n${html}`;
    fs.writeFileSync(path.join(componentsDir, filename), content);
    console.log(`Extracted ${filename}`);
}

// Write the main index.astro page
const indexAstro = `---
import Layout from '../layouts/Layout.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Projects from '../components/Projects.astro';
import Contact from '../components/Contact.astro';
import Footer from '../components/Footer.astro';
---

<Layout>
    <Navbar />
    <Hero />
    <About />
    <Projects />
    <Contact />
    <Footer />
</Layout>
`;
fs.writeFileSync(path.resolve('./src/pages/index.astro'), indexAstro);
console.log('Rebuilt index.astro');
