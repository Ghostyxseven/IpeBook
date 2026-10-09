import type { BookRequest } from '../entities/BookRequest';
import type { MyListing } from '../entities/Listing';
import type { Profile } from '../entities/Profile';
import type { HistoryEntry, PublicProfile, ReceivedRating } from '../entities/Rating';
import type { User } from '../entities/User';

const modalityLabel: Record<string, string> = {
  sale: 'Venda',
  trade: 'Troca',
  donation: 'Doação',
};

const listingStatusLabel: Record<string, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  concluido: 'Concluído',
  arquivado: 'Pausado',
};

const requestStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceita',
  rejected: 'Recusada',
  canceled: 'Cancelada',
  completed: 'Concluída',
};

export type MyDataExportInput = {
  user: User;
  profile: Profile;
  listings: MyListing[];
  sentRequests: BookRequest[];
  receivedRequests: BookRequest[];
  publicProfile: PublicProfile;
  ratingsReceived: ReceivedRating[];
  history: HistoryEntry[];
};

/**
 * Monta os dados que a própria pessoa pode baixar (Figma 07.07, "Baixar meus dados").
 *
 * Só o que o app já guarda e já mostra a ela — os mesmos dados do Perfil, da Estante, das
 * Conversas e do Histórico, sem e-mail nem senha (a própria tela promete isso em "Dados de
 * acesso privados"). Puro: sem Supabase, sem React Native (ADR 0002 e ADR 0012).
 */
export function buildMyDataExport(input: MyDataExportInput) {
  const {
    user,
    profile,
    listings,
    sentRequests,
    receivedRequests,
    publicProfile,
    ratingsReceived,
    history,
  } = input;
  return {
    geradoEm: new Date().toISOString(),
    perfil: {
      nome: user.name,
      bairro: profile.neighborhood,
      cidade: profile.city,
      membroDesde: publicProfile.memberSince,
    },
    reputacao: {
      negociacoesConcluidas: publicProfile.completedCount,
      notaMedia: publicProfile.ratingAverage,
      numeroDeAvaliacoes: publicProfile.ratingCount,
      avaliacoesRecebidas: ratingsReceived.map((rating) => ({
        de: rating.authorFirstName ?? 'Pessoa da comunidade',
        nota: rating.score,
        comentario: rating.comment,
        em: rating.createdAt,
      })),
    },
    anuncios: listings.map((listing) => ({
      titulo: listing.title,
      autor: listing.author,
      categoria: listing.category,
      modalidade: modalityLabel[listing.modality] ?? listing.modality,
      precoReais: listing.priceCents != null ? listing.priceCents / 100 : null,
      condicao: listing.condition,
      bairro: listing.neighborhood,
      situacao: listingStatusLabel[listing.status] ?? listing.status,
      publicadoEm: listing.createdAt,
    })),
    negociacoesQuePedi: sentRequests.map((request) => ({
      anuncioId: request.listingId,
      situacao: requestStatusLabel[request.status] ?? request.status,
      local: request.publicLocation,
      dia: request.meetingDate,
      horario: request.meetingTime,
      criadaEm: request.createdAt,
    })),
    negociacoesQueRecebi: receivedRequests.map((request) => ({
      anuncioId: request.listingId,
      situacao: requestStatusLabel[request.status] ?? request.status,
      local: request.publicLocation,
      dia: request.meetingDate,
      horario: request.meetingTime,
      criadaEm: request.createdAt,
    })),
    historico: history.map((entry) => ({
      titulo: entry.title,
      autor: entry.author,
      modalidade: modalityLabel[entry.modality] ?? entry.modality,
      comQuem: entry.otherFirstName ?? 'Pessoa da comunidade',
      euEraDono: entry.iWasOwner,
      avaliei: entry.rated,
      concluidaEm: entry.completedAt,
    })),
  };
}

/** O mesmo conteúdo de `buildMyDataExport`, como texto pronto para compartilhar. */
export function myDataExportText(input: MyDataExportInput): string {
  return JSON.stringify(buildMyDataExport(input), null, 2);
}
