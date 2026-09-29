# MVVM Sofisticado — Padrão do Professor (PDM)

Quando a aplicação cresce, o MVVM Simplificado pode ser evoluído para o **MVVM Sofisticado**. O professor de PDM ensina esta arquitetura em 5 camadas (mais a injeção de dependências).

Nesta versão, optamos por manter o nome clássico **`model`** (como a camada de Domínio), pois é mais bonito e fiel à sigla MVVM.

## As 5 Camadas + Factories

1. **View** – Componentes React Native responsáveis apenas por renderização;
2. **ViewModel** – Hooks que gerenciam estado da View e expõem Actions;
3. **UseCases** – Camada de orquestração de regras de negócio complexas;
4. **Model (Domínio)** – Entidades, interfaces de serviços e repositórios puros;
5. **Infraestrutura** – Implementações concretas dos Repositórios e Serviços (ex: Firebase, Axios);
6. **Factories** – Onde ocorre a Injeção de Dependências, isolando a View da Infraestrutura.

---

## Estrutura de Pastas

```
src/
├── app/                        ← Telas (Expo Router)
│   ├── index.tsx               ← View
│   └── home.tsx
├── model/                      ← Model/Domínio (Não conhece React/Firebase)
│   ├── entities/
│   │   └── User.ts             ← Entidades Puras
│   ├── services/
│   │   └── IAuthService.ts     ← Interfaces de Serviços
│   ├── repositories/
│   │   └── IUserRepository.ts  ← Interfaces de Repositórios
│   └── usecases/
│       ├── IAuthUseCases.ts    ← Interfaces de Casos de Uso
│       └── AuthUseCases.ts     ← Implementação das Regras de Negócio
├── viewmodel/
│   └── useLoginViewModel.ts    ← ViewModel (Hooks)
├── infra/                      ← Infraestrutura (Firebase, APIs, SQLite)
│   ├── services/
│   │   └── FirebaseAuthService.ts ← Implementação concreta
│   └── repositories/
│       └── FirestoreUserRepository.ts
└── factories/                  ← Fábricas (Injeção de dependências)
    └── loginFactory.ts         
```

---

## Exemplo: Fluxo de Autenticação

### 1. Model - Entidades e Interfaces

```typescript
// src/model/entities/User.ts
export class User {
  constructor(
    public readonly uID: string,
    public readonly userName: string
  ) {}
}

// src/model/services/IAuthService.ts
import { User } from "../entities/User";
export interface IAuthService {
  login(email: string, password: string): Promise<User>;
}
```

### 2. Model - Casos de Uso (Regras de Negócio)

```typescript
// src/model/usecases/AuthUseCases.ts
import { IAuthService } from "../services/IAuthService";
import { User } from "../entities/User";

export interface IAuthUseCases {
  login(email: string, password: string): Promise<User>;
}

export class AuthUseCases implements IAuthUseCases {
  // Injeção de dependência baseada em abstração
  constructor(private authService: IAuthService) {}

  async login(email: string, password: string): Promise<User> {
    if (!email || !password) {
      throw new Error("Validation Error: Email and password required");
    }
    // Orquestração: salvar em repositório local, registrar login, etc
    return this.authService.login(email, password);
  }
}
```

### 3. Infraestrutura (Implementação Concreta)

```typescript
// src/infra/services/FirebaseAuthService.ts
import { IAuthService } from "../../model/services/IAuthService";
import { User } from "../../model/entities/User";

export class FirebaseAuthService implements IAuthService {
  async login(email: string, password: string): Promise<User> {
    // Código real do Firebase auth iria aqui
    return new User("123", "User Name");
  }
}
```

### 4. ViewModel

```typescript
// src/viewmodel/useLoginViewModel.ts
import { useState } from "react";
import { IAuthUseCases } from "../model/usecases/AuthUseCases";
import { User } from "../model/entities/User";

export function useLoginViewModel(authUseCases: IAuthUseCases) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      setError(null);
      const user = await authUseCases.login(email, password);
      // Navegar ou salvar estado
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, handleLogin };
}
```

### 5. Factory (Injeção de Dependência)

```typescript
// src/factories/loginFactory.ts
import { FirebaseAuthService } from "../infra/services/FirebaseAuthService";
import { AuthUseCases } from "../model/usecases/AuthUseCases";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";

export function makeLoginViewModel() {
  const authService = new FirebaseAuthService();
  const authUseCases = new AuthUseCases(authService);
  return useLoginViewModel(authUseCases);
}
```

### 6. View (Tela)

```tsx
// src/app/index.tsx
import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { makeLoginViewModel } from "../factories/loginFactory";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Consome a Factory em vez de importar os serviços diretamente
  const { loading, error, handleLogin } = makeLoginViewModel();

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} placeholder="Email" />
      <TextInput value={password} onChangeText={setPassword} placeholder="Password" />
      <Button title="Login" onPress={() => handleLogin(email, password)} />
      {loading && <Text>Carregando...</Text>}
      {error && <Text>{error}</Text>}
    </View>
  );
}
```

## Resumo das Responsabilidades no Sofisticado

- **Model**: Contém as **regras de negócio** puras, entidades e contratos (interfaces). Não sabe de onde vêm os dados (API, Firebase) nem como são exibidos (React).
- **Infraestrutura**: Sabe **como** buscar/salvar os dados usando as bibliotecas específicas (Axios, Firebase SDK), cumprindo o contrato exigido pelo Model.
- **ViewModel**: Converte os dados e erros do Model para estados de interface (UI State).
- **Factory**: Une a Infraestrutura ao Model, e entrega para a ViewModel, isolando completamente a View.
- **View**: Apenas exibe o que a ViewModel manda e avisa a ViewModel quando o usuário interage. Não conhece nada de `infra` ou `model`.
