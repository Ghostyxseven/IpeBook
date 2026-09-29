# Injeção de Dependências e Testabilidade

Conforme a aplicação avança para o **MVVM Sofisticado**, a View não deve mais importar e instanciar manualmente os serviços e repositórios da infraestrutura (como `new FirebaseAuthService()`).

O professor ensina o uso do padrão **Factory** para Injeção de Dependências.

## O Padrão Factory (DI)

Devemos criar um arquivo para montar as dependências antes de entregá-las para a View.

```typescript
// src/factories/loginFactory.ts
import { FirebaseAuthService } from "../infra/services/FirebaseAuthService";
import { FirestoreUserRepository } from "../infra/repositories/FirestoreUserRepository";
import { AuthenticateUserUseCase } from "../model/usecases/AuthenticateUserUseCase";
import { useLoginViewModel } from "../viewmodel/useLoginViewModel";

export function makeLoginViewModel() {
  // 1. Instancia a infraestrutura
  const authService = new FirebaseAuthService();
  const userRepo = new FirestoreUserRepository();
  
  // 2. Injeta a infraestrutura nos Casos de Uso (Domínio/Model)
  const usecase = new AuthenticateUserUseCase(authService, userRepo);
  
  // 3. Retorna a ViewModel já com o Caso de Uso injetado
  return useLoginViewModel(usecase);
}
```

## Consumindo a Factory na View

A View permanece extremamente simples e sem conhecer a infraestrutura:

```tsx
// src/app/index.tsx
import { makeLoginViewModel } from "../factories/loginFactory";
import { useState } from "react";
import { View, Text, Button, TextInput } from "react-native";

const LoginScreen = () => {
  // A View chama a Factory para pegar a ViewModel já "montada"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const vm = makeLoginViewModel();

  return (
    <View>
      <Button title="Login" onPress={() => vm.handleLogin(email, password)} />
    </View>
  );
};
```

## Vantagem: Testabilidade Mocks (Test Doubles)

Essa abordagem permite testes unitários reais, pois podemos passar "Fakes" ou "Mocks" para a ViewModel sem depender do Firebase ou de APIs:

```typescript
// Exemplo de teste unitário da ViewModel
const fakeUseCase: IAuthenticateUserUseCase = {
  execute: async () => ({ uID: "1", userName: "test" })
};

// Injetamos o Fake ao invés do UseCase real
const vm = useLoginViewModel(fakeUseCase);
```
