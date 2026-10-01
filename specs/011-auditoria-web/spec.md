# 011 — Correções da auditoria Web

## Objetivo

Corrigir os problemas reproduzíveis do relatório Lighthouse enviado em 30/09/2026: zoom bloqueado, imagem desproporcional, imagem sem dimensões e arquivos de descoberta respondendo incorretamente. Reduzir o peso inicial no celular preservando marca, fonte, navegação e conteúdo.

## Aceite

- Zoom do navegador habilitado sem limite artificial.
- Marca exportada em tamanhos adequados, sem transferir o PNG original de 612.713 bytes na Web; imagens com largura e altura intrínsecas e proporção preservada.
- Fonte local comprimida em WOFF2, mantendo caracteres, pesos e licença.
- `robots.txt` válido e `llms.txt` em Markdown descrevendo somente o projeto e recursos existentes; arquivos opcionais ausentes não podem devolver o HTML da SPA como sucesso.
- Sem inventar API, WebMCP, catálogo operacional ou dados de campo. Não publicar sem autorização.
- Testes, tipos, build e fluxo Web aprovados. Medir Lighthouse local antes/depois em condições iguais; distinguir comparação local do relatório de produção e não prometer nota.

## Fora do escopo

Troca de stack, migração para SSR, implantação de CSP sem inventário, remoção de analytics autorizados em commits anteriores e suposta correção de erros internos do Lighthouse sem evidência.
