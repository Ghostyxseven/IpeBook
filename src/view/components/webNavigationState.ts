/** Mantém a seção ativa ao abrir telas internas pelo cabeçalho Web. */
export function activeWebSection(pathname: string) {
  const path = pathname.replace(/^\/app(?=\/|$)/, '');
  if (path.startsWith('/inicio') || path.startsWith('/notificacoes')) return 'inicio';
  if (path.startsWith('/explorar') || path.startsWith('/livro/')) return 'explorar';
  if (path.startsWith('/estante') || path.startsWith('/anunciar') || path.startsWith('/anuncio/'))
    return 'estante';
  if (path.startsWith('/conversas') || path.startsWith('/negociacoes')) return 'conversas';
  if (
    [
      '/perfil',
      '/pessoa/',
      '/configuracoes',
      '/privacidade-dados',
      '/alterar-senha',
      '/seu-bairro',
      '/escolher-bairro',
      '/permitir-localizacao',
      '/historico',
      '/avaliacoes',
      '/ajuda',
      '/seguranca',
    ].some((prefix) => path.startsWith(prefix))
  )
    return 'perfil';
  return null;
}
