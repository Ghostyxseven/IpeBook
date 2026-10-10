import { Link, router, usePathname, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useWebLayout } from '../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography, webLayout } from '../theme/nativeTheme';
import { AppIcon, type AppIconName } from './AppIcon';
import { Button } from './ui/Button';
import { Wordmark } from './ui/Wordmark';
import { activeWebSection } from './webNavigationState';

const sections: { name: string; label: string; href: Href; icon: AppIconName }[] = [
  { name: 'inicio', label: 'Início', href: '/inicio', icon: 'home' },
  { name: 'explorar', label: 'Explorar', href: '/explorar', icon: 'search' },
  { name: 'estante', label: 'Estante', href: '/estante', icon: 'bookmark' },
  { name: 'conversas', label: 'Conversas', href: '/conversas', icon: 'chat' },
  { name: 'perfil', label: 'Perfil', href: '/perfil', icon: 'person' },
];

/** Navegação Web persistente inclusive nas telas abertas a partir das abas. */
export function WebAppNavigation() {
  const { medium, large } = useWebLayout();
  const pathname = usePathname();
  if (!medium) return null;
  const current = activeWebSection(pathname);

  return (
    <View style={large ? styles.header : styles.rail} accessibilityLabel="Navegação principal">
      {large && (
        <Link href="/inicio" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="IpêBook, ir para início"
            style={({ focused }: { pressed: boolean; focused?: boolean }) => [
              styles.brand,
              focused && styles.focused,
            ]}
          >
            <Wordmark />
          </Pressable>
        </Link>
      )}
      {large && (
        <Link href="/explorar" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Buscar livros"
            style={({
              focused,
              hovered,
            }: {
              pressed: boolean;
              focused?: boolean;
              hovered?: boolean;
            }) => [styles.search, hovered && styles.hovered, focused && styles.focused]}
          >
            <AppIcon name="search" color={colors.onSurfaceVariant} />
            <Text style={styles.searchText}>Buscar livros</Text>
          </Pressable>
        </Link>
      )}
      <View style={large ? styles.headerLinks : styles.railLinks}>
        {sections.map((section) => {
          const selected = current === section.name;
          return (
            <Link key={section.name} href={section.href} asChild>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={section.label}
                accessibilityState={{ selected }}
                style={({
                  focused,
                  hovered,
                }: {
                  pressed: boolean;
                  focused?: boolean;
                  hovered?: boolean;
                }) => [
                  styles.link,
                  large ? styles.headerLink : styles.railLink,
                  hovered && styles.hovered,
                  selected && styles.selected,
                  focused && styles.focused,
                ]}
              >
                <AppIcon name={section.icon} color={colors.actionDeep} />
                <Text style={[styles.label, selected && styles.selectedLabel]}>
                  {section.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
      {large && (
        <View style={styles.announce}>
          <Button label="Anunciar" onPress={() => router.push('/anunciar')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: webLayout.headerHeight,
    width: '100%',
    backgroundColor: colors.background,
    borderBottomWidth: metrics.borderThin,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  rail: {
    width: webLayout.railWidth,
    backgroundColor: colors.background,
    borderRightWidth: metrics.borderThin,
    borderRightColor: colors.border,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  brand: { minHeight: metrics.touchTarget, justifyContent: 'center' },
  search: {
    flex: 1,
    maxWidth: webLayout.searchMaxWidth,
    minHeight: metrics.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.containerLow,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchText: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  headerLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  railLinks: { alignItems: 'center', gap: spacing.xs },
  link: { minHeight: metrics.touchTarget, alignItems: 'center', justifyContent: 'center' },
  headerLink: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xs,
    gap: spacing.xxs,
    borderRadius: radius.full,
  },
  railLink: {
    width: webLayout.railWidth - spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xxs,
    borderRadius: radius.medium,
  },
  label: { ...typography.labelMedium, color: colors.text },
  selectedLabel: { color: colors.actionDeep },
  selected: { backgroundColor: colors.soft },
  hovered: { backgroundColor: colors.containerHigh },
  announce: { flexShrink: 0 },
  focused: {
    outlineColor: colors.focus,
    outlineStyle: 'solid',
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
});
