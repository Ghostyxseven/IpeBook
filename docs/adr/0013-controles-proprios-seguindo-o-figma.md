# 0013 — Controles próprios seguindo a biblioteca de componentes do Figma

Data: 01/10/2026

## Status

Aceito para Android e Web. O iOS fica para a issue #10. Issues: #9 e #10.

## Contexto

O design system pede que os controles de sistema venham, de preferência, das bibliotecas da plataforma (Material 3 no Android, componentes nativos no iOS). O app usava `Button` e `TextField` próprios, feitos com React Native e tokens, sem conferência com o Figma.

O arquivo de componentes do Figma **IpêBook-Mobile** (página "05 · Componentes", consultada em 01/10/2026) define a versão IpêBook dos controles Material 3:

- **Botão:** pílula de 52 px (o de texto tem 48 px), rótulo `m3-label-lg` (14/20, peso 500) e variantes Preenchido, Contornado, Texto e Perigo.
- **Campo:** contornado, rótulo de 12 px dentro da caixa, espaçamento interno de 16/12, raio médio e erro com borda de 2 px, ícone e mensagem.

Esses componentes não são os do Material 3 puro (o botão padrão do M3 tem 40 dp de altura): são variações do IpêBook.

## Decisão

Manter `Button` e `TextField` **próprios**, ajustados ao componente do Figma no Android e na Web, sem adicionar biblioteca de componentes:

- forma, tipografia, variantes e estados conforme o Figma, usando os tokens existentes (`radius.full`, `radius.medium`, `typography.labelMedium`, `typography.bodyLarge` e o novo `typography.labelLarge`);
- ícone de erro pelo `AppIcon` (Material Symbols no Android, SF Symbols no iOS, conforme o ADR 0009);
- no iOS, a forma atual continua até a adequação aos componentes nativos (issue #10).

É o mesmo caminho do catálogo (`SearchBar`, `NavigationBar`, `ModalityChip`), que segue o Figma com componentes próprios.

## Alternativas

- **React Native Paper:** biblioteca Material 3 madura e com licença MIT. Para reproduzir a pílula de 52 px, o rótulo dentro da caixa e as cores IpêBook, seria preciso sobrescrever o tema e os estilos de quase todos os controles. Isso traria uma dependência grande e um segundo sistema de tema convivendo com `design-tokens.json`, só para dois componentes.
- **Componentes nativos via módulos do Expo:** não há controles de formulário Material 3 prontos no SDK 57 que aceitem os tokens do projeto.

## Consequências

- Uma alteração de token (raio, cor, tipografia) muda todos os botões e campos, inclusive os do catálogo.
- Diferenças de valor entre os tokens e o Figma (altura de 52 px, raio de 12 px, cores) ficam registradas em `docs/design-system/divergencias.md` até a equipe decidir a fonte da verdade.
- Se o projeto adotar uma biblioteca de componentes no futuro, a troca fica isolada em `src/view/components/ui/`.
