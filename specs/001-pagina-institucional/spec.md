# Página institucional Web

Data: 29/09/2026 · Branch: `feature/pagina-institucional`

## Objetivo e escopo

A rota `/` apresenta o IpêBook, projeto comunitário de compra, troca e doação de livros em Piripiri, PI. O usuário confirmou apresentação, termos, privacidade e LGPD, e não a tela de login. Incluir proposta, modalidades, como funciona, dúvidas, documentos e indicação honesta sobre acesso ainda indisponível.

Fora do escopo: autenticação, catálogo, mensagens, pagamentos, coleta de leads, publicação e implementação nativa.

## Critérios de aceite

1. `/` apresenta o projeto em português seguindo o design system.
2. Âncoras e menu móvel funcionam por teclado; Escape fecha o menu; foco visível.
3. Documentos legíveis e compartilháveis em `/#termos`, `/#privacidade`, `/#lgpd`, com abertura direta, recarga e histórico.
4. Textos descrevem esta apresentação e são preliminares. Não inventar controlador, contato, retenção, bases legais, certificação ou autenticação.
5. Sem analytics, cookies opcionais, formulários de dados pessoais ou consentimento fictício. Recursos e fontes locais.
6. Entrar/criar conta informam indisponibilidade em diálogo acessível sem simular sucesso.
7. Sem corte horizontal entre 320 e 1440 px; suportar ampliação, alvos de 48 px e estrutura semântica.
8. Validar domínio, ViewModel, tipos, build, fluxo real e acessibilidade. Não declarar Android/iOS validados.

## Fontes jurídicas

[LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) e [ANPD sobre cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais). Antes da operação: identificar responsável, canal dos titulares e inventário de tratamento/hospedagem.
