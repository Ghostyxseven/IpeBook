/**
 * Monta as dependências reais do catálogo (padrão Factory da disciplina).
 * Enquanto a tabela `listings` não existir no Supabase (ver specs/023-catalogo-livros), nenhuma
 * tela usa estes hooks.
 */
import { createSupabaseCatalogRepository } from '../model/repositories/supabaseCatalogRepository';
import { supabase } from '../model/repositories/supabaseClient';
import { useCatalogViewModel, useListingDetailViewModel } from '../viewmodel/useCatalogViewModel';

export const catalogRepository = createSupabaseCatalogRepository(supabase);

export const useCatalog = () => useCatalogViewModel(catalogRepository);
export const useListingDetail = (id: string) => useListingDetailViewModel(catalogRepository, id);
