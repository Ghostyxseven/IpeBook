# Tarefas

- [x] Model e testes de ponto público, mapeamento e migração.
- [x] ViewModels, filtros, formulários e testes.
- [x] Mapa, capas, seleção e integração nas telas.
- [x] Revisão, verificações automatizadas e fluxo real; registrar limites.

## Limites registrados

- Typecheck, lint e suíte de testes passaram localmente (405 testes). Validação visual real do mapa no navegador e em dispositivo não foi realizada: exige `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` configurado localmente, indisponível neste ambiente.
- A validação da migração em Postgres isolado (`scripts/verificar-mapa-sql.mjs`) depende de `@electric-sql/pglite`, não instalado neste ambiente; não executada.
- Migração SQL não aplicada remotamente (fora do escopo desta tarefa).
