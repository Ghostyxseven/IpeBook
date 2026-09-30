# 014 — Autenticação e onboarding

Responsável: Maria Clara Almeida Martins (ver `docs/DIVISAO_FEATURES.md`).

## Objetivo

Permitir que a pessoa conheça o IpêBook na primeira abertura, crie uma conta, confirme o e-mail, entre, recupere a senha e saia, com Supabase Auth (ADR 0006), no Android e no iOS. A Web continua só com a apresentação institucional (ADR 0005).

## Fluxos

1. **Abertura (splash):** enquanto a sessão carrega, mostra a marca e um indicador de carregamento com rótulo acessível.
2. **Onboarding:** três páginas curtas (o que é, as modalidades Venda, Troca e Doação, encontro seguro), com Pular, Voltar e Próxima. Aparece só na primeira abertura do celular.
3. **Entrar:** e-mail e senha, mostrar/ocultar senha, "Esqueci minha senha" e "Criar conta". Se o e-mail ainda não foi confirmado, envia um novo código e abre a verificação.
4. **Criar conta:** nome, e-mail, senha e confirmação. Depois de enviar, abre a verificação com o e-mail preenchido.
5. **Verificar e-mail:** código numérico recebido por e-mail, "Reenviar código" com espera de 60 segundos. Ao confirmar, a pessoa entra.
6. **Recuperar senha:** etapa 1 pede o e-mail e envia o código; etapa 2 pede código, nova senha e confirmação. Ao concluir, a pessoa entra com a nova senha.
7. **Sair:** na Início provisória, encerra a sessão e volta para Entrar.

## Aceite

- Validação local antes de chamar o servidor, com mensagem abaixo do campo. Os dados digitados são preservados após erro.
- Mensagens do servidor traduzidas para português acionável; nunca mostrar códigos como `invalid_credentials`.
- Botão principal mostra carregamento e impede envio duplo.
- A resposta de "Esqueci minha senha" não revela se o e-mail tem conta.
- Sem as variáveis do Supabase, as ações mostram que a autenticação não foi configurada; o app não simula sucesso.
- Teclado de e-mail, `autoComplete` e `textContentType` adequados; alvos de 48 × 48; foco visível na Web; títulos com papel de cabeçalho.
- Na Web, Entrar e Criar conta continuam mostrando o aviso de indisponibilidade.
- Política de Privacidade e Termos descrevem os dados do cadastro no aplicativo, o Supabase e as ferramentas de medição já presentes no site.
- Model e ViewModels testados com repositório em memória; mapeamento de erros do Supabase testado com cliente falso.

## Fora do escopo

Telas de conta na Web, login social, autenticação em duas etapas, exclusão de conta (feature de Perfil), tabela de perfis, termos de aceite com registro de consentimento e definição do controlador dos dados.

## Referência de design

`docs/design-system.md` (seção Experiência e acessibilidade, tela Entrar) e `design-tokens.json`. Os quadros do Figma não puderam ser inspecionados nesta etapa porque a integração com o Figma exige autenticação; a comparação com os quadros fica pendente no `verify.md`.
