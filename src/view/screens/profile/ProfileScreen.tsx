import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyListings } from '../../../factories/listings';
import { usePublicProfile } from '../../../factories/reputation';
import { SERVICE_CITY } from '../../../model/services/neighborhood';
import { publicationsLine, summarize } from '../../../model/services/profileSummary';
import { ratingsLine } from '../../../model/services/reputationFormat';
import { firstName } from '../../../model/services/userFormat';
import { useSessionContext } from '../../../viewmodel/useSession';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { FormMessage } from '../../components/ui/FormMessage';
import { Avatar } from '../../components/profile/Avatar';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Meu perfil (Figma 07.01).
 *
 * Refeito na spec 031 contra o quadro novo: a spec 026 montou esta tela sem
 * conseguir abrir o Figma (os `node-id` da issue #37 tinham morrido), e o que
 * saiu foi um cartão com nome e e-mail. O quadro pede identidade, três números
 * e uma lista de seis destinos — ver `verify.md` das specs 026 e 031.
 */
export function ProfileScreen() {
  const router = useRouter();
  const session = useSessionContext();
  const listings = useMyListings();
  const user = session.user;
  const reputation = usePublicProfile(user?.id ?? '');

  // Enquanto a lista não chegou, os números não inventam nada: ficam em "—".
  const counts = listings.status === 'ready' ? summarize(listings.listings) : null;
  const profile = reputation.status === 'ready' ? reputation.profile : null;
  const since = profile ? new Date(profile.memberSince).getFullYear() : null;
  const place = since ? `${SERVICE_CITY.label} · desde ${since}` : SERVICE_CITY.label;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.appBar}>
        <Text accessibilityRole="header" style={styles.appTitle}>
          Perfil
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Configurações"
          onPress={() => router.push('/configuracoes')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <AppIcon name="settings" color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <Avatar name={user?.name} size={64} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{user ? (firstName(user.name) ?? 'Você') : 'Você'}</Text>
            <Text style={styles.detail}>{place}</Text>
          </View>
        </View>

        <View style={styles.numbers}>
          <Number value={counts ? String(counts.total) : '—'} label="anúncios" />
          <Number value={profile ? String(profile.completedCount) : '—'} label="trocas" />
          {/* Sem nota nenhuma o número é "—", não "0,0": zero numa escala de 1 a 5
              é uma nota ruim dada a quem nunca fez nada de errado (ADR 0027). */}
          <Number
            value={
              profile?.ratingAverage ? profile.ratingAverage.toFixed(1).replace('.', ',') : '—'
            }
            label="avaliação"
          />
        </View>

        <View style={styles.list}>
          <Entry
            icon="document"
            title="Minhas publicações"
            body={counts ? publicationsLine(counts) : 'Carregando…'}
            onPress={() => router.push('/estante')}
          />
          <Entry
            icon="checkCircle"
            title="Avaliações recebidas"
            body={profile ? ratingsLine(profile) : 'Carregando…'}
            onPress={() => router.push('/avaliacoes')}
          />
          <Entry
            icon="swap"
            title="Histórico"
            body="Trocas, vendas e doações concluídas."
            onPress={() => router.push('/historico')}
          />
          <Entry
            icon="bell"
            title="Notificações"
            body="Propostas, mensagens e alertas"
            onPress={() => router.push('/notificacoes')}
          />
          <Entry
            icon="lock"
            title="Segurança e verificação"
            body="E-mail confirmado"
            onPress={() => router.push('/seguranca')}
          />
          <Entry icon="info" title="Ajuda" onPress={() => router.push('/ajuda')} />
          <Entry
            icon="logout"
            title="Sair"
            onPress={session.signOut}
            busy={session.signingOut}
            tone="danger"
          />
        </View>

        <FormMessage tone="error" message={session.error} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Number({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.number} accessible accessibilityLabel={`${value} ${label}`}>
      <Text style={styles.numberValue}>{value}</Text>
      <Text style={styles.numberLabel}>{label}</Text>
    </View>
  );
}

/** Uma linha da lista do quadro 07.01: ícone, título, apoio e a seta. */
function Entry({
  icon,
  title,
  body,
  onPress,
  busy = false,
  tone = 'plain',
}: {
  icon: AppIconName;
  title: string;
  body?: string;
  onPress: () => void;
  busy?: boolean;
  tone?: 'plain' | 'danger';
}) {
  const color = tone === 'danger' ? colors.error : colors.onSurfaceVariant;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={body}
      accessibilityState={{ busy, disabled: busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
    >
      <AppIcon name={icon} size={20} color={color} />
      <View style={styles.entryText}>
        <Text style={[styles.entryTitle, tone === 'danger' && { color: colors.error }]}>
          {title}
        </Text>
        {body ? <Text style={styles.detail}>{body}</Text> : null}
      </View>
      {tone === 'plain' ? <AppIcon name="chevronRight" color={colors.onSurfaceVariant} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.pagePadding,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
  appTitle: {
    ...typography.titleLarge,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
    flex: 1,
  },
  iconButton: {
    width: metrics.touchTarget,
    height: metrics.touchTarget,
    borderRadius: metrics.touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.pressed },
  content: {
    paddingHorizontal: metrics.pagePadding,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    maxWidth: metrics.formMaxWidth,
    width: '100%',
    alignSelf: 'center',
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identityText: { flex: 1, gap: spacing.xxs },
  name: { ...typography.brandTitle, color: colors.onSurface },
  detail: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  numbers: { flexDirection: 'row', gap: spacing.xs },
  number: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.medium,
    backgroundColor: colors.container,
  },
  numberValue: { fontSize: 22, lineHeight: 28, color: colors.onSurface },
  numberLabel: { fontSize: 12, lineHeight: 16, color: colors.onSurfaceVariant },
  list: { gap: spacing.xxs },
  entry: {
    minHeight: metrics.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: radius.small,
  },
  entryText: { flex: 1 },
  entryTitle: { ...typography.bodyLarge, color: colors.onSurface },
});
