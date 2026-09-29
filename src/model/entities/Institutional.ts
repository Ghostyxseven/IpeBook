export type LegalPage = 'termos' | 'privacidade' | 'lgpd';
export type Page = 'inicio' | LegalPage;
export type AccessIntent = 'entrar' | 'criar';
export type LegalDocument = {
  title: string;
  intro: string;
  sections: { title: string; paragraphs: string[] }[];
};
