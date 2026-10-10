import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePublicProfile } from '../../../factories/reputation';
import {
  memberSinceLabel,
  personName,
  reputationLine,
} from '../../../model/services/reputationFormat';
import { Avatar } from '../../components/profile/Avatar';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { Button } from '../../components/ui/Button';
import { useWebLayout } from '../../hooks/useWebLayout';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

/**
 * Perfil de outra pessoa (Figma 03.04), aberto pelo nome de quem anunciou.
 *
 * Mostra o que o `public_profile` devolve e nada além: nunca e-mail, bairro,
 * sobrenome ou a lista de anúncios da pessoa (ADR 0027).
 */
export function PublicProfileScreen() {
  const { large } = useWebLayout();
  const router = useRouter();
  const { id, livro } = useLocalSearchParams<{ id: string; livro?: string }>();
  const userId = String(id ?? '');
  const vm = usePublicProfile(userId);
  const listingId = livro ? String(livro) : null;

  if (vm.status === 'loading') {
    return (
      <View style={styles.screen}>
        <LoadingState message="Carregando perfil…" />
      </View>
    );
  }

  if (vm.status === 'error' || !vm.profile) {
    return (
      <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <ErrorState message={vm.error ?? ''} onRetry={vm.retry} />
        </View>
      </SafeAreaView>
    );
  }

  const { profile } = vm;
  const name = personName(profile.firstName);
  const since = memberSinceLabel(profile.memberSince);
  const actions = (
    <View style={styles.actions}>
      <Button
        label={`Conversar com ${name}`}
        onPress={() =>
          listingId ? router.push(`/livro/${listingId}/combinar`) : router.push('/conversas')
        }
        accessibilityHint={
          listingId ? 'Abre o formulário para propor local, dia e horário.' : 'Abre suas conversas.'
        }
      />
      <Button
        label="Denunciar ou bloquear"
        variant="danger"
        onPress={() =>
          router.push({
            pathname: '/(app)/seguranca/report',
            params: { userId, userName: profile.firstName ?? '', listingId: listingId ?? '' },
          })
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={[styles.content, large && styles.desktopContent]}>
        <View style={[styles.summaryColumn, large && styles.desktopSummary]}>
          <View style={styles.identity}>
            <Avatar name={profile.firstName} />
            <Text accessibilityRole="header" style={styles.name}>
              {name}
            </Text>
            <Text style={styles.body}>Conheça a pessoa antes de combinar.</Text>
          </View>
          {large && actions}
        </View>
        <View style={[styles.cardsColumn, large && styles.desktopCards]}>
          <Card
            title="Perfil confirmado"
            body={
              since
                ? `E-mail confirmado · ${since.toLocaleLowerCase('pt-BR')}.`
                : 'E-mail confirmado.'
            }
            tone="highlight"
          />
          <Card
            title="Histórico na comunidade"
            body={`${reputationLine(profile)}.`}
            onPress={
              // Sem nota nenhuma não há lista para abrir — o cartão vira só informação.
              profile.ratingCount > 0
                ? () => router.push({ pathname: '/avaliacoes', params: { pessoa: userId } })
                : undefined
            }
          />
          <Card
            title="Encontre com segurança"
            body="Prefira locais públicos e confirme pelo chat."
          />
        </View>
        {!large && actions}
      </ScrollView>
    </SafeAreaView>
  );
}

/** O "Horizontal card" do Material 3 usado três vezes no quadro 03.04. */
function Card({
  title,
  body,
  tone = 'plain',
  onPress,
}: {
  title: string;
  body: string;
  tone?: 'plain' | 'highlight';
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </>
  );
  const style = [styles.card, tone === 'highlight' && styles.cardHighlight];

  if (!onPress) {
    return (
      <View style={style} accessible accessibilityLabel={`${title}. ${body}`}>
        {content}
      </View>
    );
  }
  return (
    <View style={style}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Button label="Ver avaliações" variant="text" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    padding: metrics.pagePadding,
    gap: spacing.md,
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
  },
  desktopContent: {
    maxWidth: metrics.contentMaxWidth,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xl,
    paddingTop: spacing.xl,
  },
  summaryColumn: { gap: spacing.md },
  desktopSummary: {
    flex: 1,
    minWidth: 0,
    padding: spacing.xl,
    borderRadius: radius.extraLarge,
    backgroundColor: colors.containerLow,
  },
  cardsColumn: { gap: spacing.md },
  desktopCards: { flex: 1, minWidth: 0 },
  identity: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  name: { ...typography.brandHeadline, color: colors.onSurface, textAlign: 'center' },
  body: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  card: {
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.containerLow,
  },
  cardHighlight: { backgroundColor: colors.selected },
  cardTitle: { ...typography.titleMedium, color: colors.onSurface },
  actions: { gap: spacing.xs, paddingTop: spacing.xs },
});
