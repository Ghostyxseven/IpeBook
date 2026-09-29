const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/view/screens/InstitutionalScreen.web.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace Logos
content = content.replace(
  /<img src="\/assets\/book-open\.svg" alt="" width="32" height="32" \/>/g,
  '<img src="/assets/logo.jpg" alt="" width="36" height="36" style={{ borderRadius: "50%", objectFit: "cover" }} />',
);

// Add animation classes to Hero
content = content.replace(
  '<div className="hero-content">',
  '<div className="hero-content animate-fade-in">',
);
content = content.replace(
  '<div className="book-scene" aria-hidden="true">',
  '<div className="book-scene animate-fade-in delay-2" aria-hidden="true">',
);

// Replace Hero Copy
content = content.replace(
  'Compartilhe conhecimento.<br />Troque páginas.',
  'Venda, troque ou doe<br />livros em Piripiri.',
);
content = content.replace(
  'O projeto comunitário que incentiva o encontro entre vizinhos e livros.',
  'Conectamos vizinhos para dar novas histórias aos livros parados na estante. Tudo local, sem frete e sem intermediários.',
);
content = content.replace('Quero fazer parte', 'Quero participar');
content = content.replace(
  'Como funciona <Icon name="arrow" size={20} />',
  'Entenda o projeto <Icon name="arrow" size={20} />',
);

// Replace Modalities title
content = content.replace('O que você pode fazer no projeto', 'O que você pode fazer no IpêBook');
content = content.replace(
  /<article className={`modality-card \${item.className}`} key={item.title}>/g,
  '<article className={`modality-card animate-fade-in ${item.className}`} key={item.title}>',
);

// How it works
content = content.replace(
  'Da sua estante<br />\n                  para um novo capítulo.',
  'Como funciona<br />\n                  o IpêBook?',
);
content = content.replace(
  'Queremos tornar mais fácil encontrar livros e encontrar quem vai cuidar bem dos\n                  seus.',
  'Três passos simples para dar uma nova vida aos livros da sua estante e conhecer outras pessoas.',
);

// End section
content = content.replace(
  'Sua próxima história<br />\n              pode estar bem perto.',
  'Pronto para dar o<br />\n              próximo passo?',
);

fs.writeFileSync(file, content, 'utf8');
console.log('Textos atualizados com sucesso!');
