# Especificação — Painel de Moderação de Denúncias

## 1. Objetivo

Implementar um painel administrativo seguro para acompanhamento, filtragem e resolução de denúncias (`reports`) submetidas pela comunidade, permitindo aos moderadores manter a integridade, segurança e qualidade dos anúncios e interações no IpêBook.

## 2. Escopo

- **Incluído:**
  - Identificação de permissão de moderador (`is_moderator`).
  - Listagem paginada/ordenada de denúncias com contexto completo (denunciante, denunciado, anúncio, motivo, detalhes, status e data).
  - Filtragem por status: Pendentes (`pending`), Resolvidas (`resolved`) e Todas.
  - Ação de marcar denúncia como resolvida (`admin_resolve_report`) com confirmação.
  - Interface acessível seguindo os design tokens e padrões do projeto.
  - Cobertura completa de testes automatizados unitários, de repositório e de ViewModel.
- **Fora de escopo:**
  - Gerenciamento de cadastro de moderadores via interface (gerenciado no Supabase Auth).
  - Punições automáticas (banimento automático) sem intervenção humana.

## 3. Requisitos Funcionais

- **RF1:** O sistema deve verificar se o usuário autenticado possui perfil de moderador. Usuários não autorizados que tentarem acessar a lista de moderação devem receber erro de autorização (`unauthorized`).
- **RF2:** O moderador deve visualizar a lista de denúncias exibindo:
  - Alvo da denúncia (título do anúncio com link/contexto ou nome da pessoa denunciada).
  - Nome de quem denunciou.
  - Motivo padronizado e detalhes complementares fornecidos.
  - Indicador de status (Pendente em amarelo/âmbar, Resolvida em verde).
  - Data/hora relativa ou legível da denúncia.
- **RF3:** O moderador pode filtrar a visualização entre denúncias "Pendentes", "Resolvidas" ou "Todas".
- **RF4:** O moderador pode marcar uma denúncia pendente como resolvida através de um diálogo de confirmação.
- **RF5:** Ao resolver uma denúncia, a lista e os contadores devem atualizar imediatamente na interface.

## 4. Requisitos Não Funcionais

- **RNF1 (Segurança):** Dados de denúncias de terceiros não podem ser lidos por usuários comuns via consultas diretas ao banco (garantido por RLS e `security definer` com validação de moderador).
- **RNF2 (Acessibilidade):** Botões com área mínima de 48×48 px, textos com contraste adequado e rótulos acessíveis para leitores de tela.
- **RNF3 (Desempenho):** Atualizações de estado otimistas ou imediatas com feedback claro de carregamento.

## 5. Critérios de Aceite

1. Usuário comum tentando listar denúncias de moderação recebe recusa/erro de não autorizado.
2. Moderador consegue carregar a lista de denúncias com sucesso.
3. Filtros por "Pendentes" e "Resolvidas" isolam corretamente as denúncias correspondentes.
4. Resolver uma denúncia pendente altera seu status para `resolved` no banco e na tela.
5. Todos os testes passam sem regressões (`npm run verify`).
