/**
 * Monta as dependências reais da leitura de ISBN (padrão Factory da disciplina).
 * As telas usam este hook e não conhecem a Open Library.
 */
import { createOpenLibraryBookLookupRepository } from '../model/repositories/openLibraryBookLookupRepository';
import { useIsbnScanViewModel } from '../viewmodel/useIsbnScanViewModel';

export const bookLookupRepository = createOpenLibraryBookLookupRepository();

export const useIsbnScan = () => useIsbnScanViewModel(bookLookupRepository);
