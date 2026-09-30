# 013 — Base do aplicativo nativo

## Objetivo

Criar a estrutura comum que as quatro features do IpêBook usam: navegação com Expo Router, tema nativo a partir de `design-tokens.json`, componentes base de formulário e os estados transversais de carregamento, vazio, erro e sem conexão. A apresentação Web em `/` deve continuar funcionando e com o mesmo desempenho.

## Usuários e cenários

- **Pessoa da equipe** cria uma tela nova em `src/app/(app)/` e usa `Button`, `TextField` e os estados de feedback sem redefinir cores, raios e alturas.
- **Leitor no celular** abre o app e vê uma abertura enquanto a sessão carrega. Se perder a internet, recebe um aviso claro com a opção de tentar de novo.
- **Visitante na Web** continua vendo a apresentação institucional em `/` e os documentos em `/#termos`, `/#privacidade`, `/#lgpd` e `/#seguranca`.

## Aceite

1. Expo Router no Android e no iOS, rotas em `src/app/` e proteção de rotas: `(auth)` só sem sessão, `(app)` só com sessão (ADR 0005).
2. Tema nativo gerado dos tokens, com altura de controle, raio de campo e cartão e margem de página por plataforma (Android 56/16/18/24, iOS 52/20/22/24, Web 48/14/18/32). Nenhum hexadecimal duplicado nos componentes nativos.
3. `Button` com variantes primária, secundária e texto e estados pressionado, desabilitado, carregando e foco visível na Web. Alvo mínimo de 48 × 48.
4. `TextField` com rótulo persistente, dica, erro abaixo do campo (texto, não só cor), `accessibilityLabel` e opção de mostrar/ocultar senha com nome acessível.
5. Estados `LoadingState`, `EmptyState`, `ErrorState` (com "Tentar novamente") e `OfflineBanner` com mensagem concreta e próxima ação.
6. A página institucional Web mantém o comportamento, os testes, o build e o tamanho do JavaScript inicial. Arquivos ausentes continuam respondendo 404.
7. Tipos, testes e build Web aprovados.

## Fora do escopo

Telas do app na Web (ADR 0005); telas das features de catálogo, negociação e perfil; ícones por plataforma (Material Symbols e SF Symbols), que exigem uma decisão de biblioteca; carregamento da fonte Roboto no iOS.
