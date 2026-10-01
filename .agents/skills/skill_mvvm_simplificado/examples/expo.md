# MVVM Simplificado — Expo / React Native

## Estrutura de pastas

```
src/
├── models/
│   └── user.ts
├── repositories/
│   └── userRepository.ts
├── viewmodels/
│   └── useUserViewModel.ts
└── screens/
    └── UserScreen.tsx
```

## Model

```typescript
// models/user.ts
export interface User {
  id: string;
  nome: string;
  avatar: string;
}
```

## Repository

```typescript
// repositories/userRepository.ts
import { User } from '../models/user';

export const userRepository = {
  async buscarTodos(): Promise<User[]> {
    const response = await fetch('https://api.exemplo.com/users');
    if (!response.ok) throw new Error('Falha na requisição');
    return response.json();
  },
};
```

## ViewModel

```typescript
// viewmodels/useUserViewModel.ts
import { useState, useCallback } from 'react';
import { User } from '../models/user';
import { userRepository } from '../repositories/userRepository';

export function useUserViewModel() {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const dados = await userRepository.buscarTodos();
      setUsuarios(dados);
    } catch {
      setErro('Não foi possível carregar os usuários.');
    } finally {
      setCarregando(false);
    }
  }, []);

  return { usuarios, carregando, erro, carregarUsuarios };
}
```

## Screen (View)

```tsx
// screens/UserScreen.tsx
import { useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUserViewModel } from '../viewmodels/useUserViewModel';

export function UserScreen() {
  const { usuarios, carregando, erro, carregarUsuarios } = useUserViewModel();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  if (carregando) return <ActivityIndicator />;

  if (erro) return (
    <View>
      <Text>{erro}</Text>
      <TouchableOpacity onPress={carregarUsuarios}>
        <Text>Tentar novamente</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={usuarios}
      keyExtractor={u => u.id}
      renderItem={({ item }) => <Text>{item.nome}</Text>}
    />
  );
}
```
