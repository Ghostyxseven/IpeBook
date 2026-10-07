import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthError } from '../entities/AuthError.ts';
import type { AccountRepository } from './AccountRepository';
import { mapSupabaseError } from './supabaseAuthRepository.ts';
import { COVERS_BUCKET } from './supabaseListingsRepository.ts';

/** Partes do cliente usadas; facilita testar com um cliente falso. */
export type SupabaseAccountClient = Pick<SupabaseClient, 'auth' | 'rpc' | 'storage'>;

const mapError = (error: unknown) => {
  // PGRST202: a função delete_own_account ainda não foi criada neste projeto (ADR 0023).
  if ((error as { code?: string } | null)?.code === 'PGRST202')
    return new AuthError('not_configured', error);
  return mapSupabaseError(error);
};

export function createSupabaseAccountRepository(
  client: SupabaseAccountClient | null,
): AccountRepository {
  return {
    async deleteAccount() {
      if (!client) throw new AuthError('not_configured');
      const { data, error } = await client.auth.getSession();
      if (error) throw mapError(error);
      const userId = data.session?.user.id;
      if (!userId) throw new AuthError('unknown');

      // 1. Capas na pasta da pessoa: o banco não consegue apagá-las.
      const covers = client.storage.from(COVERS_BUCKET);
      const { data: files, error: listError } = await covers.list(userId, { limit: 1000 });
      if (listError) throw mapError(listError);
      if (files?.length) {
        const { error: removeError } = await covers.remove(
          files.map((file) => `${userId}/${file.name}`),
        );
        if (removeError) throw mapError(removeError);
      }

      // 2. A conta e, em cascata, os dados ligados a ela.
      const { error: deleteError } = await client.rpc('delete_own_account');
      if (deleteError) throw mapError(deleteError);

      // 3. A sessão salva já não vale; sair só no aparelho evita outra chamada ao servidor.
      await client.auth.signOut({ scope: 'local' }).catch(() => undefined);
    },
  };
}
