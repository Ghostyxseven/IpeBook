import { SymbolView } from 'expo-symbols';
import { colors } from '../theme/nativeTheme';

/** Nomes por plataforma (ADR 0009): SF Symbols no iOS, Material Symbols no Android e na Web. */
const symbols = {
  home: { ios: 'house', android: 'home', web: 'home' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  logout: {
    ios: 'rectangle.portrait.and.arrow.right',
    android: 'logout',
    web: 'logout',
  },
  swap: { ios: 'arrow.left.arrow.right', android: 'swap_horiz', web: 'swap_horiz' },
  bookmark: { ios: 'bookmark', android: 'bookmark', web: 'bookmark' },
  checkCircle: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  bell: { ios: 'bell', android: 'notifications', web: 'notifications' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
  chevronRight: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  error: { ios: 'exclamationmark.circle', android: 'error', web: 'error' },
  chevronLeft: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  // Gestão de anúncios e perfil (specs 025 e 026).
  add: { ios: 'plus', android: 'add', web: 'add' },
  edit: { ios: 'pencil', android: 'edit', web: 'edit' },
  archive: { ios: 'archivebox', android: 'archive', web: 'archive' },
  unarchive: { ios: 'arrow.uturn.up', android: 'unarchive', web: 'unarchive' },
  delete: { ios: 'trash', android: 'delete', web: 'delete' },
  photo: { ios: 'photo', android: 'add_photo_alternate', web: 'add_photo_alternate' },
  person: { ios: 'person', android: 'person', web: 'person' },
  shelf: { ios: 'books.vertical', android: 'library_books', web: 'library_books' },
  document: { ios: 'doc.text', android: 'description', web: 'description' },
  calendar: { ios: 'calendar', android: 'calendar_today', web: 'calendar_today' },
  place: { ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' },
  info: { ios: 'info.circle', android: 'info', web: 'info' },
  chat: { ios: 'bubble.left.and.bubble.right', android: 'chat_bubble', web: 'chat_bubble' },
} as const;

export type AppIconName = keyof typeof symbols;

/** Ícone decorativo: o rótulo acessível fica no controle que o contém. */
export function AppIcon({
  name,
  size = 24,
  color = colors.text,
}: {
  name: AppIconName;
  size?: number;
  color?: string;
}) {
  return (
    <SymbolView
      name={symbols[name]}
      size={size}
      tintColor={color}
      style={{ width: size, height: size }}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}
