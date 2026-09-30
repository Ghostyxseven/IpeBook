# Sumário Editorial Mobile e Ajuste Visual da Fita

## Escopo

Aprimorar o componente de Sumário (navegação móvel) em `InstitutionalScreen.web.tsx`, transformando a lista simples e esvaziada em um Sumário Editorial refinado de capítulos que preenche harmoniosamente o espaço vertical da tela em dispositivos móveis, e corrigir a sobreposição da fita marcadora amarela sobre o título da capa do livro.

## Aceite

1. O Sumário móvel lista os capítulos da apresentação com numeração editorial (`01` a `06`), títulos legíveis e subtítulos que explicam o conteúdo de cada folha.
2. Inclui atalho explícito para o Início/Capa (`#inicio`).
3. O capítulo atualmente selecionado recebe destaque visual suave e atributo `aria-current="page"`.
4. O perfil do Instagram é apresentado em seção de Comunidade dedicada, com indicação visual clara de abertura externa (`↗`) e atributos de segurança (`rel="noopener noreferrer"`).
5. O rodapé do Sumário contém aviso discreto de "Aplicativo em construção • Piripiri, PI", botões acessíveis de Entrar e Criar Conta (alvos >= 48px) e atalhos para termos e privacidade.
6. A fita marcadora na capa encadernada (`.cover-scene-caption`) é reposicionada para a borda lateral direita, eliminando qualquer sobreposição ou corte sobre o título "Histórias que continuam." e o logotipo.
7. A navegação desktop permanece limpa, horizontal e sem quebras visuais.
8. Fechamento por tecla Escape e gerenciamento de foco preservados.

## Correção do cabeçalho — 30/09/2026

Eliminar o recorte da marca e do botão provocado pelo menu sobreposto ao cabeçalho. Manter marca e Fechar centralizados na mesma linha, margens alinhadas aos capítulos, título e contagem próximos ao topo e divisor discreto antes da lista. O controle deve ter alvo mínimo de 48 × 48 px. Validar em 320, 390, 768 e 1440 px, incluindo abrir, fechar, Escape e seleção de capítulo, sem transbordamento ou sobreposição.
