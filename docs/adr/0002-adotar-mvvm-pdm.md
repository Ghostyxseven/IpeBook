# 2. Adotar MVVM Simplificado (Padrão PDM)

Data: 2026-09-29

## Status

Aceito

## Contexto

Precisamos de uma arquitetura limpa e bem definida para o desenvolvimento do IpeBook, evitando o código espaguete onde regras de negócio, interface gráfica e lógica de navegação se misturam num único arquivo (o famoso padrão "CR - Codifica e Remenda"). Para projetos móveis em React Native / Expo, foi solicitada a utilização da arquitetura ensinada na disciplina de PDM (Programação para Dispositivos Móveis).

## Decisão

Adotaremos o **MVVM Simplificado (Padrão PDM)**, o qual separa rigorosamente a aplicação em três camadas distintas:
1. **Model**: Entidades puras, serviços com regras de negócio e repositórios (acesso a dados). Não conhece React nem UI.
2. **ViewModel**: Implementada como Custom Hooks (ex: `useLoginViewModel.ts`). Gerencia o estado da tela, conecta a View ao Model e expõe ações (`handleLogin`, etc), mas não contém JSX ou componentes visuais.
3. **View**: Telas e componentes (arquivos `.tsx`). Importa a ViewModel para exibir dados e reagir a estados (loading, erro, etc) sem conter regras de negócio diretamente.

Para garantir que todos os agentes de IA sigam essa arquitetura automaticamente, também instalamos a skill correspondente (`skill_mvvm_simplificado`).

## Consequências

- O código das telas ficará mais enxuto, concentrando-se apenas na renderização (UI).
- A lógica de negócio ficará isolada em Models/Services, facilitando os testes e manutenção.
- O estado da tela será sempre gerenciado de forma reativa pelas ViewModels (Custom Hooks).
- Qualquer IA que trabalhar neste repositório será automaticamente guiada pelas instruções da skill local instalada em `.agents/skills`.
