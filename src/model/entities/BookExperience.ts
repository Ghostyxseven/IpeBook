export type ReadingMode = 'livro' | 'normal';
export type GuideId = 'comprar' | 'vender' | 'trocar' | 'doar';
export type Modality = 'Venda' | 'Troca' | 'Doação';
export type ExampleFilter = 'Todos' | Modality;
export type ReaderGuide = {
  id: GuideId;
  label: string;
  title: string;
  intro: string;
  steps: { title: string; description: string }[];
  checklist: string[];
  note: string;
};
export type BookExample = {
  id: string;
  title: string;
  category: string;
  modality: Modality;
  cover: 'forest' | 'sun' | 'clay';
  description: string;
  condition: string;
} & (
  | { modality: 'Venda'; price: number }
  | { modality: 'Troca'; interest: string }
  | { modality: 'Doação' }
);
