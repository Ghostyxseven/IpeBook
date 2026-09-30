# IA e governança — IpêBook

## Contrato para agentes

Ao gerar ou revisar interface:

1. Leia `AGENTS.md`, `docs/design-system.md` e `design-tokens.json`.
2. Consulte o quadro correspondente no Figma.
3. Use tokens existentes. Não invente hex, radius, spacing ou motion se já houver equivalente.
4. Procure componentes nativos antes de desenhar controles.
5. Preserve a semântica de Venda, Troca, Doação, Reservado e Concluído.
6. Não misture famílias de ícones.
7. Garanta acessibilidade antes de considerar a tarefa concluída.
8. Registre divergências justificadas no PR.

## Fonte de verdade

- **Figma:** decisão visual e biblioteca de componentes.
- **design-tokens.json:** contrato de implementação.
- **docs/design-system/**: regras de uso e governança.
- **código:** consumidor do contrato, não origem de novos tokens globais.

Uma alteração global não está concluída se Figma, tokens e documentação estiverem divergentes.

## Status de componentes

- **Ready:** validado e disponível.
- **Review:** utilizável para teste, ainda em revisão.
- **Deprecated:** não usar em telas novas.
- **Proposal:** proposta ainda não incorporada ao padrão.

## Checklist de mudança

- [ ] Figma atualizado.
- [ ] Tokens atualizados.
- [ ] Documentação atualizada.
- [ ] Android verificado.
- [ ] iOS verificado.
- [ ] Web verificado.
- [ ] Acessibilidade verificada.
- [ ] Valores visuais locais justificados quando não houver token.
- [ ] PR registra divergências intencionais.

## Naming

Tokens: categoria/subcategoria/nome.

Componentes: nome de produto ou função clara. Evite nomes baseados em uma única tela quando o componente é reutilizável.
