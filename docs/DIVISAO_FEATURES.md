# Divisão de Features e Responsabilidades (MVP IpêBook)

Para garantir uma entrega paralela e sem conflitos de código, estruturamos o trabalho em torno de **Features (Funcionalidades)** e não apenas de telas avulsas. Assim, cada desenvolvedor será "dono" de um fluxo completo, responsável por implementar o _Model_, _ViewModel_ e _View_ do seu domínio.

**Equipe:**

1. Maria Clara Almeida Martins
2. Micael Cardoso Reis
3. Antonio Carlos Gomes
4. Eric Vinícius dos Santos Oliveira

---

## 1. Maria Clara Almeida Martins

**Feature:** Autenticação e Experiência Inicial (Onboarding)

- **Objetivo:** Garantir que o usuário consiga entrar na plataforma de forma segura, recuperar sua conta e ser recebido (onboarding). Também inclui a base de estabilidade da interface.
- **Fluxos e Telas englobadas:**
  - Splash & Onboarding
  - Fluxo completo de Login / Criação de Conta
  - Verificação de Conta e Recuperação de Senha
  - **Componentes/Estados base transversais:** Sem conexão, Carregamento, Erros genéricos e Estado Vazio.

## 2. Micael Cardoso Reis

**Feature:** Exploração e Descoberta de Livros (Catálogo)

- **Objetivo:** O motor principal do aplicativo, onde o usuário encontra o que ler. Envolve listagens pesadas, filtros e pesquisa.
- **Fluxos e Telas englobadas:**
  - Feed / Tela de Início
  - Explorar / Descobrir novos títulos
  - Mecanismo de Busca e Filtros
  - Busca por categoria (sem tela própria; decisão de 02/10/2026, #26)
  - Página de Detalhes do Livro
  - Configurações gerais e sistema de Notificações
- **Extras da descoberta (decisão de 02/10/2026, #27):** fora do MVP, a abrir como spec só quando alguém assumir, nesta ordem:
  1. Compartilhar anúncio (Figma 44, 58 e 59): copiar link e compartilhamento nativo, sem tabela nova.
  2. ~~Favoritos (Figma 37)~~: aberto em 08/10/2026 — ADR 0032, spec 018.
  3. Alerta de desejo (Figma 56): exige tabela, gatilho de notificação e integração com o ADR 0011; depende de negociação e notificações maduras.

## 3. Antonio Carlos Gomes

**Feature:** Fluxo de Negociação (Adoção/Troca) e Segurança

> Desde 02/10/2026 esta feature é do **Micael Cardoso Reis**. O Antonio entregou a negociação mínima (#38, PR #84) e a base de segurança (spec 027, ADR 0017); o restante (#39, #40 e #54) continua com o Micael.

- **Objetivo:** O coração transacional do aplicativo (solicitar livro e combinar a entrega), atrelado às funcionalidades de _Trust & Safety_ (confiança e segurança da comunidade).
- **Fluxos e Telas englobadas:**
  - Motor de solicitação: Enviar pedido, visualizar recebidos e responder.
  - Acompanhamento do status da adoção.
  - Logística: Escolher ponto de encontro e confirmar a entrega.
  - Segurança (Moderação): Denunciar usuários e anúncios, Bloquear pessoas.

## 4. Eric Vinícius dos Santos Oliveira

**Feature:** Gestão de Inventário (Anúncios) e Identidade (Perfil)

- **Objetivo:** Toda a área onde o usuário cadastra e gerencia o que ele tem para doar/trocar, além do gerenciamento de sua imagem e histórico na comunidade.
- **Fluxos e Telas englobadas:**
  - Fluxo completo de Cadastro, Edição, Arquivamento e Exclusão de Livros/Anúncios.
  - Visualização de "Minhas publicações" e "Minha estante".
  - Identidade: Meu perfil, visualização do perfil de outros usuários, Histórico de trocas/doações e sistema de Avaliações.

---

_Nota: Ao iniciar uma feature, o desenvolvedor deve criar sua branch a partir da `develop` (ex: `feature/autenticacao`, `feature/exploracao-livros`) e aplicar os princípios do **MVVM Simplificado**._
