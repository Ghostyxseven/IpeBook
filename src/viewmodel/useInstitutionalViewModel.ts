import { useEffect, useState } from 'react';
import type { AccessIntent } from '../model/entities/Institutional';
import { documents, legalLinks, questions, resolvePage } from '../model/services/institutional.ts';

export function useInstitutionalViewModel() {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [accessIntent, setAccessIntent] = useState<AccessIntent | null>(null);
  const page = resolvePage(hash);
  const document = page === 'inicio' ? null : documents[page];

  useEffect(() => {
    const handleLocation = () => {
      setHash(window.location.hash);
      setMenuOpen(false);
      setAccessIntent(null);
    };
    window.addEventListener('hashchange', handleLocation);
    return () => window.removeEventListener('hashchange', handleLocation);
  }, []);

  return {
    page,
    document,
    hash,
    menuOpen,
    accessIntent,
    legalLinks,
    questions,
    toggleMenu: () => setMenuOpen((open) => !open),
    closeMenu: () => setMenuOpen(false),
    openAccess: (intent: AccessIntent) => {
      setMenuOpen(false);
      setAccessIntent(intent);
    },
    closeAccess: () => setAccessIntent(null),
  };
}
