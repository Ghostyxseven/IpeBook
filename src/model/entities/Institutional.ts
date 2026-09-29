export type LegalPage = 'termos' | 'privacidade' | 'lgpd' | 'seguranca';
export type Page = 'inicio' | LegalPage;
export type AccessIntent = 'entrar' | 'criar';
export type LegalDocument = {
  title: string;
  intro: string;
  summary: string[];
  sources: { label: string; url: string }[];
  sections: { title: string; paragraphs: string[] }[];
};
