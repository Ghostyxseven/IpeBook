# IpeBook 🌳📚

O **IpêBook** é uma plataforma comunitária para doação, troca e descoberta de livros. Encontre livros disponíveis perto de você, compartilhe os que já leu e ajude novas histórias a circularem pela comunidade de forma simples e sustentável.

---

## 🛠 Tecnologias

Este aplicativo é construído utilizando as seguintes tecnologias:

*   **React Native** / **Expo**: Framework para desenvolvimento móvel cruzado (iOS e Android).
*   **TypeScript**: Adicionando tipagem estática e maior confiabilidade ao código.

---

## 📐 Arquitetura: MVVM Simplificado (Padrão PDM)

O projeto adota rigorosamente a arquitetura **MVVM Simplificada**, ensinada na disciplina de Programação para Dispositivos Móveis (PDM). O objetivo é isolar a lógica de negócios da interface gráfica.

A estrutura de pastas (`src/`) divide as responsabilidades em:

*   **Model (`model/`)**: Regras de negócio puras, entidades e acesso a dados (APIs, Firebase, etc). **Não conhece React ou UI**.
    *   `entities/`
    *   `services/`
    *   `repositories/`
*   **ViewModel (`viewmodel/`)**: Conecta o Model à View. Implementados como *Custom Hooks*, gerenciam o estado da tela (dados, erro, loading) e expõem funções, sem possuir elementos visuais (JSX).
*   **View (`app/` e `view/`)**: Telas e componentes visuais. Somente renderiza os dados da ViewModel e aciona suas ações. **Não contém regras de negócio ou chamadas de API**.

*(Para mais detalhes, consulte o documento de decisão arquitetural: [ADR 0002](docs/adr/0002-adotar-mvvm-pdm.md))*

---

## 🔄 Fluxo de Desenvolvimento e Padrões

O projeto utiliza um conjunto estrito de ferramentas e regras para manter a qualidade e o histórico íntegros.

1.  **GitHub Spec Kit**: O desenvolvimento é orientado a especificações. Antes de implementar qualquer funcionalidade, ela deve ser especificada, planejada e validada.
2.  **Architecture Decision Records (ADRs)**: Qualquer decisão de engenharia importante fica registrada na pasta `docs/adr/`.
3.  **Git e Versionamento**:
    *   **Branches**: A branch `main` é sagrada (produção). O desenvolvimento contínuo ocorre na `develop`. Toda nova funcionalidade deve ser feita em uma *feature branch* (ex: `feature/nova-tela`) a partir da `develop`.
    *   **Commits**: Utilizamos o **Conventional Commits** (ex: `feat:`, `fix:`, `docs:`, `chore:`).

*(Para detalhes de versionamento, veja o [ADR 0003](docs/adr/0003-estrategia-de-git-e-commits.md))*

---

## 🚀 Como rodar o projeto localmente

Siga as instruções abaixo para rodar o app no seu simulador ou dispositivo físico:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor do Expo:**
   ```bash
   npx expo start
   ```

3. **Abra o aplicativo:**
   * **Web:** Pressione `w` no terminal para abrir o aplicativo no seu navegador.
   * **Android:** Pressione `a` no terminal para rodar no emulador Android.
   * **iOS:** Pressione `i` no terminal para rodar no simulador iOS (somente macOS).
   * **Dispositivo físico:** Baixe o aplicativo "Expo Go" no seu celular e escaneie o QR Code exibido no terminal.
