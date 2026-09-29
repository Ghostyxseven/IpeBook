# MVVM Simplificado — React + TypeScript

## Estrutura de pastas

```
src/
├── models/
│   └── user.ts
├── repositories/
│   └── userRepository.ts
├── viewmodels/
│   └── useUserViewModel.ts
└── pages/ (ou screens/)
    └── UserPage.tsx
```

## Model

```typescript
// models/user.ts
export interface User {
  id: string;
  nome: string;
  email: string;
}
```

## Repository

```typescript
// repositories/userRepository.ts
import { User } from '../models/user';

export const userRepository = {
  async buscarTodos(): Promise<User[]> {
    const response = await fetch('/api/users');
    return response.json();
  },

  async buscarPorId(id: string): Promise<User> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  },
};
```

## ViewModel (hook)

```typescript
// viewmodels/useUserViewModel.ts
import { useState, useEffect } from 'react';
import { User } from '../models/user';
import { userRepository } from '../repositories/userRepository';

interface UserViewModelState {
  usuarios: User[];
  carregando: boolean;
  erro: string | null;
}

export function useUserViewModel() {
  const [state, setState] = useState<UserViewModelState>({
    usuarios: [],
    carregando: false,
    erro: null,
  });

  async function carregarUsuarios() {
    setState(s => ({ ...s, carregando: true, erro: null }));
    try {
      const usuarios = await userRepository.buscarTodos();
      setState(s => ({ ...s, usuarios, carregando: false }));
    } catch (e) {
      setState(s => ({ ...s, erro: 'Erro ao carregar usuários', carregando: false }));
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return { ...state, carregarUsuarios };
}
```

## View

```tsx
// pages/UserPage.tsx
import { useUserViewModel } from '../viewmodels/useUserViewModel';

export function UserPage() {
  const { usuarios, carregando, erro, carregarUsuarios } = useUserViewModel();

  if (carregando) return <p>Carregando...</p>;
  if (erro) return <p>{erro} <button onClick={carregarUsuarios}>Tentar novamente</button></p>;
  if (usuarios.length === 0) return <p>Nenhum usuário encontrado.</p>;

  return (
    <ul>
      {usuarios.map(u => (
        <li key={u.id}>{u.nome} — {u.email}</li>
      ))}
    </ul>
  );
}
```
