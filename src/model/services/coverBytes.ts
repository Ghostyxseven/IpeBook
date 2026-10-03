/**
 * Converte o base64 que o seletor de fotos devolve nos bytes que vão para o Storage.
 *
 * No Android e no iOS, `fetch(uri).arrayBuffer()` de um arquivo local não devolve a
 * imagem (o arquivo chegava ao bucket com 14 bytes). O guia do Supabase para React
 * Native indica subir um `ArrayBuffer` montado a partir do base64, que é o que fazemos.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const clean = base64.replace(/^data:[^,]*,/, '').replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
