import type { User } from '../entities/User';

type Listener = (user: User | null) => void;

/**
 * Distribui as mudanças de usuário para as ViewModels e permite segurá-las.
 *
 * Na recuperação de senha, confirmar o código já cria uma sessão no provedor, mas a
 * autenticação só está concluída depois que a nova senha é gravada (issue #8). Enquanto o
 * portão está fechado, os avisos do provedor são descartados e quem pergunta o usuário
 * atual recebe `null`; ao reabrir, o repositório informa o resultado final.
 */
export function createUserChangeGate() {
  const listeners = new Set<Listener>();
  let holding = false;

  const notify = (user: User | null) => listeners.forEach((listener) => listener(user));

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get listenerCount() {
      return listeners.size;
    },
    get holding() {
      return holding;
    },
    /** Aviso vindo do provedor: ignorado enquanto o portão estiver fechado. */
    emit(user: User | null) {
      if (!holding) notify(user);
    },
    hold() {
      holding = true;
    },
    /** Reabre o portão; se `user` for informado, avisa o resultado final. */
    release(...result: [] | [User | null]) {
      holding = false;
      if (result.length) notify(result[0]);
    },
  };
}
