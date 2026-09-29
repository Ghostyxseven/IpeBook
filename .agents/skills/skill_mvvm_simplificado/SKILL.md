---
name: skill_mvvm_simplificado
description: Use when creating, editing, or reviewing any React Native or Expo application code. This skill enforces the simplified MVVM architecture exactly as taught in the PDM course (Programação para Dispositivos Móveis). MUST be followed whenever creating screens, components, services, entities, or viewmodels. Apply when the user mentions tela, componente, serviço, entidade, ViewModel, hook, autenticação, navegação, estado, ou qualquer código de aplicação móvel. Do NOT allow mixing responsibilities between layers.
---

# MVVM Simplificado — Padrão do Professor (PDM)

## Regra Central

**Todo código de aplicação React Native / Expo DEVE seguir MVVM Simplificado exatamente como ensinado na disciplina PDM.**

Evite o padrão "CR — Codifica & Remenda" (também chamado "Big Tripe"): concentrar tudo — interface, regras de negócio e navegação — em um único arquivo. Isso torna o código difícil de testar, reaproveitar e evoluir.

---

## As 3 Camadas

### Model
Concentra todo o domínio da aplicação. É dividido em:

- **`entities/`** — tipos e entidades puras (ex: `User.ts`)
- **`services/`** — regras de negócio e operações específicas (ex: `AuthService.ts`)
- **`repositories/`** — abstração de acesso a dados (ex: `TaskRepository.ts`)

O Model **não conhece** React, hooks nem nada de UI.

### ViewModel
Implementada como **Custom Hook** (ex: `useLoginViewModel.ts`).

Responsabilidades:
- Gerenciar o estado da tela (`loading`, `error`, dados)
- Expor as ações que a View pode chamar (`handleLogin`, `handleLogout`)
- Chamar os serviços/repositórios do Model

A ViewModel **não contém** elementos de interface (sem JSX, sem componentes visuais).

### View
Representada pelas telas e componentes (arquivos `.tsx`).

Responsabilidades:
- Importar a ViewModel e consumir seu estado e ações
- Renderizar o conteúdo com base no estado
- Estados de UI puros (como valor digitado num campo) podem ficar na View

A View **não contém** lógica de negócio nem chama serviços diretamente.

---

## 🔄 Fluxo de Trabalho e Testes (Obrigatório)

Quando o usuário pedir uma nova funcionalidade ou tela, você DEVE seguir a ordem de implementação abaixo. 

Para **CADA** etapa, aplique o ciclo de teste rigoroso:
**Criou ➔ Testou ➔ Deu erro? Consertou ➔ Testou de novo ➔ Funcionou? Vai para o próximo.**
*NUNCA avance para a próxima funcionalidade ou camada sem que a atual esteja validada e funcionando.*

### Ordem de Implementação:
1. **Camada Model (Domínio):** Defina a Entidade e o Serviço/Repositório primeiro.
   - *Validação:* A regra de negócio está correta? A lógica lida com cenários de falha? Só avance quando o serviço estiver sólido.
2. **Camada ViewModel:** Crie o Custom Hook importando o Model.
   - *Validação:* O estado (loading, error, sucesso) está mudando na ordem certa? O hook expõe as actions corretamente? Só avance se estiver perfeito.
3. **Camada View:** Desenhe a tela consumindo a ViewModel.
   - *Validação:* Teste todos os cenários visuais (estado de erro renderiza algo? loading mostra spinner?). Funcionou? Funcionalidade entregue.

---

## Estrutura de Pastas Obrigatória

```
src/
├── app/                        ← telas gerenciadas pelo Expo Router
│   ├── _layout.tsx             
│   └── index.tsx               ← View
├── model/
│   ├── entities/
│   │   └── User.ts             ← Entidades puros
│   ├── services/
│   │   └── AuthService.ts      ← Regras de negócio
│   └── repositories/
├── viewmodel/
│   └── useLoginViewModel.ts    ← Custom Hook = ViewModel
└── view/
    └── components/             
```

> **Dica do professor:** use `camelCase` para hooks e `PascalCase` para componentes React.

---

## Exemplo Completo (exatamente como o professor ensina)

### Etapa 1 — Entidade no Model
```typescript
// src/model/entities/User.ts
export type User = {
  uID: string;
  userName: string;
};
```

### Etapa 2 — Service no Model
```typescript
// src/model/services/AuthService.ts
import { User } from "../entities/user";

export class AuthService {
  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (email !== "user@example.com" || password !== "password") {
      throw new Error("invalid credentials");
    }
    return { uID: "123", userName: "user123" };
  }
}
```

### Etapa 3 — ViewModel (Custom Hook)
```typescript
// src/viewmodel/useLoginViewModel.ts
import { useState } from "react";
import { User } from "../model/entities/user";
import { AuthService } from "../model/services/authService";

export function useLoginViewModel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new AuthService();

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const user = await service.login(email, password);
      setUserId(user.uID);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { userId, loading, error, handleLogin };
}
```

### Etapa 4 — View consumindo a ViewModel
```tsx
// src/app/index.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userId, loading, error, handleLogin } = useLoginViewModel();

  useEffect(() => {
    if (userId) router.replace("/home");
  }, [userId]);

  if (loading) return <Text>loading...</Text>;

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} />
      <Button title="login" onPress={() => handleLogin(email, password)} />
      {error && <Text>error: {error}</Text>}
    </View>
  );
};
const styles = StyleSheet.create({ /* estilos */ });
export default Index;
```

---

## O que é estado da aplicação vs. estado de UI?

| Estado de UI (fica na View) | Estado da aplicação (fica na ViewModel) |
|---|---|
| Valor digitado num campo de texto | `userId` (usuário autenticado) |
| Aba selecionada | `loading` (operação em andamento) |

---

## ✅ Checklist de Autocorreção (Self-Correction)

**ATENÇÃO AGENTE:** Antes de entregar o código final ao usuário, faça uma revisão rigorosa do que você acabou de escrever:

- [ ] A minha **View** tem algum `if` de regra de negócio? *(Se sim, mova a regra para a ViewModel/Model).*
- [ ] A minha **ViewModel** importa elementos visuais como `<View>` ou `<Text>`? *(Se sim, remova. O hook deve ser puro).*
- [ ] Eu usei `fetch()` ou `axios` diretamente dentro do arquivo da **View**? *(Se sim, mova para um Repository/Service).*
- [ ] O **Model** importa algo do React ou Expo? *(Se sim, remova. O Model é puro).*
- [ ] Eu criei telas sem uma ViewModel correspondente? *(Se sim, crie o Hook).*
- [ ] O ciclo "Criou -> Testou -> Consertou" foi respeitado antes de avançar?

Se você identificar qualquer violação acima, **reconstrua e corrija o código** autonomamente antes de declará-lo pronto para o usuário.

---

## Evolução futura (MVVM Sofisticado)

Após dominar o MVVM Simplificado, consulte o arquivo `examples/mvvm_sofisticado.md` na pasta da skill para evoluir o código adicionando Casos de Uso (UseCases) e uma camada de Infraestrutura, isolando o Model completamente.
