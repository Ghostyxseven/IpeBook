# Padrões de Estado e Tratamento de Erros

No padrão MVVM do professor de PDM, os estados de UI e os erros seguem regras estritas.

## Os 4 estados obrigatórios na ViewModel

Todo ViewModel deve gerenciar explicitamente estes 4 estados da interface:

| Estado | Quando ocorre | O que a View mostra |
|---|---|---|
| **loading** | Buscando/Processando dados | Spinner / Skeleton |
| **erro** | Falha na operação | Mensagem + botão de retry |
| **vazio** | Sucesso mas sem dados | Mensagem informativa |
| **sucesso** | Dados carregados | Lista / conteúdo |

## Regra: Nunca omitir estados
- Se não tratar `loading` → a tela pisca ou mostra dados antigos
- Se não tratar `erro` → o usuário não sabe o que aconteceu
- Se não tratar `vazio` → parece que está carregando para sempre

---

## Fluxo de Erros (Os 5 Passos do Professor)

De acordo com o livro (MVVM Sofisticado), o fluxo de tratamento de erros **DEVE** seguir exatamente estas 5 etapas:

1. **Infraestrutura:** Captura os erros específicos das bibliotecas (Firebase, HTTP, SQLite, Axios).
2. **Tradução:** A Infraestrutura converte esses erros técnicos em erros puros de domínio (ex: `AuthFailedError`).
3. **Use Cases (Casos de Uso):** Podem traduzir erros e mapear mensagens para regras de negócio específicas.
4. **ViewModel:** Transforma os erros de domínio/negócio em estados textuais legíveis para a View (`vm.error`).
5. **View:** Apenas exibe o estado.

> 🚨 **REGRA DE OURO:** A View **NUNCA** faz `try/catch`. O tratamento fica exclusivo para a ViewModel ou camadas inferiores.
