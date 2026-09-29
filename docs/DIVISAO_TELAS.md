# Divisão de Telas e Responsabilidades (MVP IpêBook)

Para garantir uma entrega paralela e sem conflitos de código, dividimos as ~40 telas e estados do aplicativo de forma lógica e agrupada por domínio (contexto da aplicação). Assim, cada membro da equipe foca em um fluxo completo.

**Equipe:**
1. Maria Clara Almeida Martins
2. Micael Cardoso Reis
3. Antonio Carlos Gomes
4. Eric Vinícius dos Santos Oliveira

---

## 1. Maria Clara Almeida Martins 
**Domínio:** Entrada, Acesso e Estados Base *(10 Telas/Estados)*
- [ ] Splash
- [ ] Onboarding
- [ ] Entrar
- [ ] Criar conta
- [ ] Recuperar senha
- [ ] Verificação de conta
- [ ] Estado: Sem conexão
- [ ] Estado: Vazio
- [ ] Estado: Erro
- [ ] Estado: Carregamento

## 2. Micael Cardoso Reis
**Domínio:** Navegação Principal e Configurações *(10 Telas/Estados)*
- [ ] Início
- [ ] Descobrir
- [ ] Busca
- [ ] Filtros
- [ ] Categorias
- [ ] Detalhes do livro
- [ ] Configurações
- [ ] Ajuda/Sobre
- [ ] Notificações
- [ ] Tela de confirmação/feedback (componente global)

## 3. Antonio Carlos Gomes
**Domínio:** Adoção/Troca e Segurança *(10 Telas/Estados)*
- [ ] Solicitar adoção
- [ ] Solicitações recebidas
- [ ] Detalhes da solicitação
- [ ] Status da adoção
- [ ] Escolher ponto de encontro
- [ ] Confirmar entrega
- [ ] Adoção concluída
- [ ] Denunciar usuário
- [ ] Denunciar anúncio
- [ ] Bloquear usuário

## 4. Eric Vinícius dos Santos Oliveira
**Domínio:** Perfil, Livros e Anúncios *(10 Telas/Estados)*
- [ ] Meu perfil
- [ ] Editar perfil
- [ ] Perfil de outro usuário
- [ ] Minha estante
- [ ] Histórico de trocas/doações
- [ ] Avaliações
- [ ] Cadastrar livro
- [ ] Editar livro/anúncio
- [ ] Minhas publicações
- [ ] Excluir/arquivar anúncio

---
*Nota: Ao iniciar o desenvolvimento de um item, o desenvolvedor deve criar uma feature branch a partir da `develop` (ex: `feature/tela-login`) e utilizar a arquitetura MVVM Simplificada conforme definido nos ADRs.*
