import type { NotificationKind } from '../entities/Notification';
import type { AppNotification } from '../entities/Notification';

export const notificationKindLabels: Record<NotificationKind, string> = {
  request_received: 'Pedidos recebidos',
  request_accepted: 'Pedidos aceitos',
  request_declined: 'Pedidos recusados',
  listing_reserved: 'Livro reservado',
  deal_completed: 'Negociação concluída',
};

export const notificationKindDescriptions: Record<NotificationKind, string> = {
  request_received: 'Quando alguém pedir um dos seus livros.',
  request_accepted: 'Quando aceitarem um pedido seu.',
  request_declined: 'Quando recusarem um pedido seu.',
  listing_reserved: 'Quando um livro seu ficar reservado.',
  deal_completed: 'Quando uma negociação for concluída.',
};

const months = [
  'jan.',
  'fev.',
  'mar.',
  'abr.',
  'mai.',
  'jun.',
  'jul.',
  'ago.',
  'set.',
  'out.',
  'nov.',
  'dez.',
];

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "agora", "há 5 min", "há 3 h", "há 2 dias" ou, depois de uma semana, "30 de set." */
export function relativeTime(createdAt: string, now: Date = new Date()) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  const elapsed = Math.max(0, now.getTime() - date.getTime());
  if (elapsed < MINUTE) return 'agora';
  if (elapsed < HOUR) return `há ${Math.floor(elapsed / MINUTE)} min`;
  if (elapsed < DAY) return `há ${Math.floor(elapsed / HOUR)} h`;
  const days = Math.floor(elapsed / DAY);
  if (days < 7) return days === 1 ? 'há 1 dia' : `há ${days} dias`;
  const sameYear = date.getFullYear() === now.getFullYear();
  const day = `${date.getDate()} de ${months[date.getMonth()]}`;
  return sameYear ? day : `${day} de ${date.getFullYear()}`;
}

export const isUnread = (notification: Pick<AppNotification, 'readAt'>) =>
  notification.readAt === null;

/** Frase única lida pelo leitor de tela; "não lida" não depende de cor nem de marca visual. */
export function notificationAccessibilityLabel(
  notification: AppNotification,
  now: Date = new Date(),
) {
  return [
    isUnread(notification) ? 'Não lida' : null,
    notification.title,
    notification.body.trim() || null,
    relativeTime(notification.createdAt, now),
  ]
    .filter(Boolean)
    .join(', ');
}

/** Rótulo do ícone de acesso: "Avisos", "1 aviso não lido" ou "3 avisos não lidos". */
export function unreadCountLabel(count: number) {
  if (count <= 0) return 'Avisos';
  return count === 1 ? '1 aviso não lido' : `${count} avisos não lidos`;
}

/** Texto curto do contador no ícone: vazio sem avisos e "99+" acima de 99. */
export function unreadBadgeText(count: number) {
  if (count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export type NotificationGroupKey = 'today' | 'week' | 'earlier';

const groupTitles: Record<NotificationGroupKey, string> = {
  today: 'Hoje',
  week: 'Esta semana',
  earlier: 'Anteriores',
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Dia do aviso em relação a hoje, no fuso do aparelho: 0 é hoje, 1 é ontem. */
function daysAgo(createdAt: string, now: Date) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY);
}

/** "Hoje" (mesmo dia), "Esta semana" (nos 6 dias anteriores) ou "Anteriores" (Figma 35). */
export function notificationGroup(createdAt: string, now: Date = new Date()): NotificationGroupKey {
  const days = daysAgo(createdAt, now);
  if (days === null) return 'earlier';
  if (days <= 0) return 'today';
  return days < 7 ? 'week' : 'earlier';
}

/**
 * Hora curta do subtítulo, conforme o grupo (Figma 35): "agora", "35 min" ou "10h" hoje;
 * "Seg", "Dom" na semana; "30 set." ou "25 dez. 2025" depois.
 */
export function notificationTimeLabel(createdAt: string, now: Date = new Date()) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  const group = notificationGroup(createdAt, now);
  if (group === 'today') {
    const elapsed = Math.max(0, now.getTime() - date.getTime());
    if (elapsed < MINUTE) return 'agora';
    if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min`;
    return `${Math.floor(elapsed / HOUR)}h`;
  }
  if (group === 'week') return weekdays[date.getDay()];
  const day = `${date.getDate()} ${months[date.getMonth()]}`;
  return date.getFullYear() === now.getFullYear() ? day : `${day} ${date.getFullYear()}`;
}

/** Subtítulo da linha: "Vidas Secas por Dom Casmurro · 10h"; sem texto, só a hora. */
export function notificationSubtitle(
  notification: Pick<AppNotification, 'body' | 'createdAt'>,
  now: Date = new Date(),
) {
  const time = notificationTimeLabel(notification.createdAt, now);
  const body = notification.body.trim();
  return [body || null, time || null].filter(Boolean).join(' · ');
}

export type NotificationSection = {
  key: NotificationGroupKey;
  title: string;
  data: AppNotification[];
};

/** Agrupa avisos já ordenados do mais novo ao mais antigo, sem criar seções vazias. */
export function groupNotifications(
  items: AppNotification[],
  now: Date = new Date(),
): NotificationSection[] {
  const sections: NotificationSection[] = [];
  for (const item of items) {
    const key = notificationGroup(item.createdAt, now);
    const last = sections[sections.length - 1];
    if (last && last.key === key) last.data.push(item);
    else sections.push({ key, title: groupTitles[key], data: [item] });
  }
  return sections;
}
