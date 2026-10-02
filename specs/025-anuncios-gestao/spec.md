# 025 — Anúncios: cadastrar, editar, arquivar e excluir

Responsável: Eric Vinícius dos Santos Oliveira (ver `docs/DIVISAO_FEATURES.md`). Issue #36.

## Objetivo

Permitir que a pessoa autenticada publique os livros que tem para vender, trocar ou doar, e depois cuide deles: editar, arquivar e excluir. É o pattern **Publicar anúncio** do design system — dados do livro → modalidade → revisar → publicar — só com cadastro manual; a leitura do ISBN ficou para a issue #52.

Esta é a feature que cumpre o requisito obrigatório do trabalho **"dados que o usuário cria, edita e exclui"**. Nenhuma outra parte do aplicativo atende a esse requisito, e ela destrava a #37 (Minhas publicações), a #38 (negociação) e a #28 (conferir o catálogo com anúncios reais).

Os anúncios vão para a tabela `listings` do Supabase, definida no ADR 0008 e já aplicada. A Web continua só com a apresentação institucional (ADR 0005).

## Fluxos

1. **Publicar (Figma 08, 19, 20 e 32):** um fluxo em quatro passos, com o progresso visível e o botão Voltar em cada um.
   1. **Dados do livro:** título, autor, categoria (lista fixa do ADR 0008), estado do exemplar e descrição opcional.
   2. **Modalidade:** Venda (com preço), Troca (com as condições) ou Doação. O campo que aparece muda com a escolha e nunca sobra o campo da modalidade anterior.
   3. **Foto (opcional):** uma imagem do exemplar, da galeria ou da câmera, enviada ao bucket `listing-covers`, na pasta com o id da pessoa. Sem foto, o anúncio nasce com a capa ilustrativa que o catálogo já desenha.
   4. **Revisar e publicar:** o resumo do que será gravado, com acesso para voltar e corrigir cada passo.
2. **Publicado (Figma 09, 21 e 22):** confirmação com o anúncio recém-criado e o caminho para ver na estante.
3. **Editar (Figma 38 e 40):** o mesmo formulário já preenchido, com as mensagens de erro do Figma 40. Trocar a modalidade limpa o campo da anterior **na mesma gravação**, porque o banco recusa preço fora da venda e condições fora da troca.
4. **Arquivar:** tira do catálogo sem perder o histórico. Reversível por "Republicar".
5. **Excluir:** apaga o anúncio e a foto. Pede confirmação e avisa que não dá para desfazer.

## Aceite

- Criar, editar, arquivar e excluir funcionam nas três modalidades.
- Anúncio publicado aparece no catálogo de outra conta; arquivado, concluído ou excluído some.
- Venda exige preço maior que zero; troca exige as condições; doação não aceita preço. As três regras valem **antes** de chamar o servidor, com a mensagem do Figma 40, e o banco é a segunda linha de defesa.
- Mudar de modalidade na edição grava os três campos juntos (`modality`, `price_cents`, `trade_terms`); nunca um `UPDATE` parcial que viole a constraint.
- **Anúncio `reservado` ou `concluido` é só leitura.** Editar, arquivar e excluir valem apenas em `disponivel` — a troca de situação pertence à feature de negociação (#38), e mexer no preço de um livro já prometido quebraria o combinado com a outra pessoa.
- Excluir o anúncio **apaga a foto do bucket**. O bucket é público: um arquivo órfão continua acessível por link para quem já o tinha, e "excluí meu anúncio" tem de significar que sumiu.
- Trocar a foto na edição envia a nova com nome próprio e remove a antiga, nessa ordem. Se a remoção falhar, o anúncio fica correto e sobra um arquivo sem uso — o contrário deixaria o anúncio sem capa.
- Estados: carregando, enviando (com o progresso da foto), erro com "Tentar de novo", sem conexão e sessão expirada.
- Preço digitado em reais e gravado em centavos (`integer`), sem float.
- Alvos de 48 × 48, rótulos acessíveis em ícones, campos com rótulo visível e erro associado, títulos com papel de cabeçalho, texto ampliável e respeito a movimento reduzido.
- Model e ViewModels testados com repositório em memória; montagem da consulta e mapeamento de erros do Supabase testados com cliente falso.

## Fora do escopo

Leitura do ISBN (#52); avaliações, histórico e perfil de outras pessoas (#53); Meu perfil e Minha estante (#37, spec 026); negociação e troca de situação (#38, Antonio); excluir a conta (#47); anunciar pela Web.

## Dependências

- **ADR 0008** (tabela `listings`, bucket `listing-covers` e RLS), já aplicado no Supabase da equipe. A issue #23 registra a concordância.
- **ADR 0014** (este PR): nome da foto, remoção da capa e situações que podem ser editadas.
- A spec 026 (Perfil) usa `listMine` daqui para montar a Minha estante.

## Referência de design

`docs/design-system/components-patterns.md` (pattern Publicar anúncio, Book Card, Status Badge e Empty State), `docs/design-system/referencia/` (README de Button, TextField, Chip, Dialog, Snackbar e BottomSheet) e `design-tokens.json`.

**Atenção:** os `node-id` do Figma citados na issue #36 **não existem mais** — o arquivo foi reorganizado em 01/10/2026 (capa "v1.0 · Em revisão") e a numeração das páginas mudou. Esta spec foi escrita pela cópia local do design system e pelo pattern documentado. A conferência visual contra os quadros novos fica registrada no `verify.md` quando os links forem repostos.
