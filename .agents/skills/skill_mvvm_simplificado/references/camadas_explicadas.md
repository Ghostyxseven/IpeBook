# 📚 O que é cada camada? (Explicação Didática)

Se você está confuso com a sopa de letrinhas do MVVM Sofisticado, aqui está uma explicação simples e direta do papel de cada pasta no seu projeto.

---

### 🎨 1. View (`app/` ou `view/`) — "A Vitrine"
A View é a tela do aplicativo. É o arquivo `.tsx` onde ficam os botões, textos e listas.
- **Personalidade:** Ela é "burra" e obediente.
- **O que faz:** Ela não toma decisões difíceis. Ela apenas olha para a ViewModel e diz: *"Opa, a ViewModel falou que tá carregando, vou mostrar um spinner"* ou *"Opa, o usuário clicou no botão de login, vou avisar a ViewModel"*.
- **O que é proibido:** Ter regras de negócio (ex: `if (senha.length < 6)`), e fazer chamadas de API (`fetch` ou `axios`).

---

### 🧠 2. ViewModel (`viewmodel/`) — "O Gerente da Tela"
Implementada como um Custom Hook do React (`useLoginViewModel.ts`).
- **Personalidade:** É o meio-campo entre o que o usuário vê (View) e o cérebro do app (Model).
- **O que faz:** Segura o estado da tela. É ela quem cria as variáveis `loading` (carregando), `error` (erro) e guarda os dados que vão aparecer. Quando a View avisa que o usuário clicou em "Login", a ViewModel pega o email e a senha e manda para o Model processar.
- **O que é proibido:** Importar componentes visuais (`Text`, `View`, `Button`). A ViewModel é 100% código, sem visual.

---

### 👑 3. Model / Domínio (`model/`) — "O Chefe das Regras"
É o coração do aplicativo. Não sabe que o React existe, não sabe se é um app de celular ou um site.
- **Personalidade:** Puro, rígido e manda em tudo.
- **O que tem dentro:**
  - **`entities/` (Entidades):** O formato das coisas. Ex: `User.ts` (id, nome, email).
  - **`services/` ou `repositories/`:** São apenas Contratos (Interfaces). O Model diz: *"Eu preciso de um serviço que busque usuários no banco"*, mas ele não faz o trabalho.
  - **`usecases/` (Casos de Uso):** São as regras pesadas. Exemplo: *"Para fazer uma compra, primeiro verifica se tem saldo, depois desconta o valor, depois gera um recibo"*. O Caso de Uso orquestra o trabalho.

---

### 👷‍♂️ 4. Infraestrutura (`infra/`) — "O Operário (Trabalho Sujo)"
Aqui fica a comunicação com o mundo externo (Internet, Firebase, Banco de Dados, GPS).
- **Personalidade:** Trabalhador sujo. É ele quem vai sujar as mãos com bibliotecas pesadas.
- **O que faz:** Lê os contratos que o Model criou e obedece. Se o Model pediu um serviço que busca usuários, a Infraestrutura cria um arquivo `FirebaseAuthService.ts` que vai lá na internet, bate no Firebase, converte a resposta e entrega prontinha para o Model.
- **A grande vantagem:** Se amanhã você trocar o Firebase por um servidor em Node.js, você **só apaga a pasta Infra**. Nenhuma tela do seu app vai quebrar.

---

### 🏭 5. DI (`di/`) — "A Fábrica (Dependency Injection)"
- **Personalidade:** O Montador de quebra-cabeças.
- **O que faz:** A View não deve saber que o Firebase existe. Então, na pasta `di/` (Injeção de Dependências), nós criamos uma "Factory" (Fábrica). A Fábrica pega o Operário (Infra), apresenta para o Chefe (Model), coloca tudo dentro do Gerente (ViewModel) e entrega empacotado para a View usar. 
- **Exemplo prático:** `makeLoginViewModel()` junta tudo e devolve o hook pronto pra tela.
