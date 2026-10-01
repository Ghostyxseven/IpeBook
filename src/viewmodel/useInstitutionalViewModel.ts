import { useEffect, useState } from 'react';
import type { AccessIntent } from '../model/entities/Institutional';
import {
  canonicalPath,
  contact,
  documents,
  instagram,
  legalLinks,
  questions,
  resolveRoute,
} from '../model/services/institutional.ts';

type Place = { path: string; hash: string };

function currentPlace(): Place {
  return typeof window === 'undefined'
    ? { path: '/', hash: '' }
    : { path: window.location.pathname, hash: window.location.hash };
}

export function useInstitutionalViewModel() {
  const [place, setPlace] = useState<Place>(currentPlace);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessIntent, setAccessIntent] = useState<AccessIntent | null>(null);
  const page = resolveRoute(place.path, place.hash);
  const document = page === 'inicio' ? null : documents[page];

  useEffect(() => {
    // Links antigos (/#privacidade) e endereços desconhecidos passam para o endereço canônico.
    const syncLocation = () => {
      const canonical = canonicalPath(window.location.pathname, window.location.hash);
      if (canonical) window.history.replaceState(null, '', canonical);
      setPlace(currentPlace());
    };
    syncLocation();
    const handleLocation = () => {
      syncLocation();
      setMenuOpen(false);
      setAccessIntent(null);
    };
    window.addEventListener('hashchange', handleLocation);
    window.addEventListener('popstate', handleLocation);
    return () => {
      window.removeEventListener('hashchange', handleLocation);
      window.removeEventListener('popstate', handleLocation);
    };
  }, []);

  /** Navegação interna sem recarregar a página; links externos e com modificadores ficam com o navegador. */
  function navigate(href: string) {
    const target = new URL(href, window.location.origin);
    if (target.pathname === window.location.pathname && target.hash) {
      if (target.hash !== window.location.hash) window.location.hash = target.hash;
      return;
    }
    window.history.pushState(null, '', target.pathname + target.search + target.hash);
    setPlace(currentPlace());
    setMenuOpen(false);
    setAccessIntent(null);
  }

  return {
    page,
    document,
    hash: place.hash,
    path: place.path,
    menuOpen,
    accessIntent,
    legalLinks,
    contact,
    instagram,
    questions,
    navigate,
    toggleMenu: () => setMenuOpen((open) => !open),
    closeMenu: () => setMenuOpen(false),
    openAccess: (intent: AccessIntent) => {
      setMenuOpen(false);
      setAccessIntent(intent);
    },
    closeAccess: () => setAccessIntent(null),
  };
}
