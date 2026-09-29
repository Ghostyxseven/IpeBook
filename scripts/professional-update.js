const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/view/screens/InstitutionalScreen.web.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace logo.jpg with logo-clean.png
content = content.replace(/logo\.jpg/g, 'logo-clean.png');

// Remove BookComposition import
content = content.replace("import { BookComposition } from '../components/BookComposition';\n", "");

// Replace BookComposition with the new image in Hero
content = content.replace('<BookComposition />', '<img src="/assets/logo-clean.png" alt="IpêBook" className="hero-illustration" />');

// Make sure header is sticky and professional (we can add a class or let CSS do it)
// Add some staggered animation classes to Modality cards if not already there
content = content.replace(/className={`modality-card animate-fade-in \${item\.className}`}/g, 'className={`modality-card animate-fade-in delay-${index + 1} ${item.className}`}');
// We need to pass index to the map
content = content.replace('modalities.map((item) => (', 'modalities.map((item, index) => (');

fs.writeFileSync(file, content, 'utf8');
console.log('TSX atualizado para visual mais profissional!');
