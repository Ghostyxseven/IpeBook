import { CryptoDigestAlgorithm, digest, getRandomValues } from 'expo-crypto';

// Adaptador mínimo para o PKCE do Supabase no Android/iOS. Não implementa WebCrypto completo.
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: {}, configurable: true });
}
if (!globalThis.crypto.getRandomValues) {
  Object.defineProperty(globalThis.crypto, 'getRandomValues', { value: getRandomValues });
}
if (!globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: {
      async digest(algorithm: AlgorithmIdentifier, data: BufferSource): Promise<ArrayBuffer> {
        const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
        if (name.toUpperCase() !== 'SHA-256') {
          throw new Error('O adaptador de PKCE suporta somente SHA-256.');
        }
        return digest(CryptoDigestAlgorithm.SHA256, data);
      },
    },
  });
}
