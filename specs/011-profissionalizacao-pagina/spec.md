# Profissionalização da página institucional

## Objetivo e escopo

Elevar o acabamento técnico e de acessibilidade da página institucional sem alterar o significado do conteúdo nem criar funcionalidades de produto. Inclui qualidade automatizada (testes, lint, CI), segurança de hospedagem, metadados de compartilhamento, acessibilidade do viewport e dos diálogos, e consistência dos dados e da documentação.

Fora do escopo (dependem de decisão da equipe): identificação do responsável e e-mail de contato nos documentos legais, lista de espera, rotas reais no lugar de fragmentos, modo de leitura sem livro 3D, backend, otimização de imagens e fonte, revisão jurídica.

## Critérios de aceite

- Todos os testes passam em qualquer máquina, sem caminhos locais fora do repositório.
- `npm run verify` executa tipos, lint, formatação e testes; o CI repete esses passos e o build Web.
- Zoom por pinça não é bloqueado no navegador móvel.
- Compartilhar o link mostra título, descrição e imagem (Open Graph).
- Cabeçalhos de segurança e cache definidos na hospedagem estática.
- A trava de rolagem é compartilhada: diálogos e menu não restauram a rolagem antes da hora.
- A data de revisão dos documentos vem do Model, não está fixa na View.
- A estante apresenta exemplos suficientes das três modalidades, sempre rotulados como fictícios.
- Nome do projeto e identificadores deixam de ser `temp-app`.

## Validação

Tipos, lint, formatação, testes, build Web. Limitações registradas em `verify.md`.
