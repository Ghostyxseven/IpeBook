# Verificação e continuidade

Data: 29/09/2026. Branch `feature/pagina-institucional`, derivada de `develop`, base `08f61ec`. Sem commits ou publicação.

## Entrega

Página institucional Web na raiz, modalidades, funcionamento, apresentação do projeto, dúvidas e documentos em `/#termos`, `/#privacidade` e `/#lgpd`. O usuário corrigiu a organização: `App.web.tsx` e `src/app/index.web.tsx` apenas exportam a tela; todo JSX de apresentação fica em `src/view/`. Model e ViewModel permanecem separados.

## Verificações executadas

- `npm run typecheck`: aprovado. Ajustado alias relativo do tsconfig, pois o TypeScript 7 já instalado transitivamente não aceita `baseUrl`; versão agora declarada explicitamente.
- `npm test`: arquivos de testes de domínio e ViewModel aprovados. Cobrem destinos legais/desconhecidos, documentos preliminares, transições de navegação, menu e diálogo.
- `npm run format:check`: aprovado após adicionar o script de verificação Web.
- `npm run build:web`: exportação real via Expo 57/Metro. HTML com `lang="pt-BR"`, metadados em português e rolagem de documento.
- Playwright MCP no build servido em localhost: navegação, abertura direta e recarga dos três documentos, histórico, retorno, FAQ por teclado, menu e diálogo testados, incluindo retenção de foco com Tab/Shift+Tab, Escape e retorno do foco ao acionador. Script reproduzível: `scripts/verificar-web.js` via `browser_run_code_unsafe` com `filename`.
- Larguras 320, 375, 390, 768, 1024 e 1440 px: sem transbordamento horizontal após ajustar o contorno decorativo da ilustração.
- axe-core no Chromium: nenhuma violação automática WCAG A/AA nas páginas inicial, Termos, Privacidade, LGPD e diálogo. Não equivale a auditoria completa com leitor de tela.
- Fonte Roboto carregada localmente; ícones de marca carregados, 32 × 32 px e arquivo SVG não vazio. Capturas de desktop/celular inspecionadas em `.playwright-mcp/` (evidências locais ignoradas pelo Git).
- Fluxo testado sem erros JavaScript. Sem cookies, localStorage ou sessionStorage. Requisições da apresentação observadas apenas para recursos locais.
- `git diff --check`: aprovado. Revisão do diff: sem credenciais, integrações de rastreamento, publicação, alterações da entrada nativa ou dependências novas de produção.

## Correções durante a validação

Corrigidos import TS para teste Node, configuração TypeScript, template HTML que bloqueava rolagem, transbordamento decorativo em telas estreitas e foco/Escape do menu e diálogo. O Expo não aceita o SVG como `web.favicon`; o favicon SVG é declarado no HTML e a configuração Web usa saída `single`, sem conversão automática para ICO.

## Limites e próximo passo

- Documentos legais são preliminares, não certificação de conformidade. Aguardam identidade do controlador/responsável, e-mail/canal oficial, hospedagem/logs, retenção e demais práticas reais antes de publicação/operação.
- Entrar/Criar conta mostram indisponibilidade. Não há autenticação, catálogo, negociação, pagamento ou formulário de dados pessoais.
- Android/iOS, leitor de tela real, navegadores além do Chromium e infraestrutura de produção não foram validados. Não há pré-renderização/SEO completo nem carregamento inicial sem JavaScript.
- Teste da ViewModel usa jsdom compartilhado; `IPEBOOK_JSDOM_PATH` permite apontar outro ambiente. Node 26.8.2 usado na execução.
- `npm install` informou 10 vulnerabilidades moderadas na árvore auditada; não foi executado `audit fix` nem ampliado o escopo para atualizar dependências existentes.
- Próximo passo: informar responsável/canal para complementar documentos antes de publicar; desenvolver autenticação em funcionalidade separada quando solicitado.
