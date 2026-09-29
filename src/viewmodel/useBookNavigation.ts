import { useEffect, useState } from 'react';

export const bookPages = [
  { id: 'inicio', label: 'Uma boa história' },
  { id: 'sobre', label: 'Sobre o projeto' },
  { id: 'como-funciona', label: 'Comprar, vender, trocar e doar' },
  { id: 'em-construcao', label: 'A estante de possibilidades' },
  { id: 'duvidas', label: 'Dúvidas frequentes' },
  { id: 'proximo-capitulo', label: 'O próximo capítulo' },
  { id: 'informacoes', label: 'Informações do projeto' },
];

export function useBookNavigation(hash: string) {
  const index = Math.max(
    0,
    bookPages.findIndex((page) => `#${page.id}` === hash),
  );
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  function goTo(next: number) {
    if (next >= 0 && next < bookPages.length && next !== index) {
      window.location.hash = bookPages[next].id;
    }
  }
  return { index, reducedMotion, goTo, pages: bookPages };
}
