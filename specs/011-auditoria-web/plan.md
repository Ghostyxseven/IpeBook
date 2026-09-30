# Plano

Branch `fix/lighthouse-web`, criada de `develop` limpo em `c480c9a`. Manter Expo 57, React 19 e MVVM. Otimizar derivados da imagem por redimensionamento/compressão com ImageMagick instalado; preservar original. Comprimir Roboto com `woff2_compress` instalado, sem substituir família ou licença. Ajustar metadados e arquivos estáticos em `public` e roteamento Vercel conforme necessário.

Verificar diagnóstico e ganho usando o Lighthouse já instalado no pacote local chrome-devtools-mcp (13.4.1; o relatório recebido usa 13.5.0), com Chromium e CDP/Puppeteer, sem Playwright. Testar exportação e gestos, dimensões/zoom, respostas HTTP e conteúdo de descoberta. Referências: Expo SDK 57, documentação oficial de arquivos públicos consultada via Context7, auditoria llms.txt do Chrome e esquema/auditoria ARD oficial.

O preset `create-react-app` é incompatível com a hospedagem estritamente estática adotada no ADR 0004 e faz URLs de arquivos ausentes caírem no HTML. Usar `framework: null` (Other), mantendo build e diretório explícitos; não criar fallback universal. Todos os destinos existentes são fragmentos da raiz, portanto não precisam de rewrites. `ai-catalog.json` é opcional e não existe porque o site não oferece recursos de agentes: deve responder 404, conforme a auditoria ARD oficial.

O Lighthouse incorporado no MCP omite métricas de desempenho (auditorias "Shim Audit"); seus números de performance não serão usados. Usar CLI completo 13.5.0 isolado em `/tmp`, sem dependência nova no projeto, para medir antes/depois. Os resultados do bundle parcial só comprovam os avisos de viewport/robots/llms.
