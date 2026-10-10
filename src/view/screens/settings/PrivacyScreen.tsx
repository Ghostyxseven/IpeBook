import {
  ActivityIndicator,
  Platform,
  Pressable,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeleteAccount, useExportMyData } from '../../../factories/account';
import { useSessionContext } from '../../../viewmodel/useSession';
import { AppIcon, type AppIconName } from '../../components/AppIcon';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormMessage } from '../../components/ui/FormMessage';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const focusRing = Platform.select({
  web: {
    outlineColor: colors.focus,
    outlineStyle: 'solid' as const,
    outlineWidth: metrics.focusWidth,
    outlineOffset: metrics.focusOffset,
  },
  default: {},
});

/**
 * Privacidade e dados (Figma 07.07): o que fica visível, a localização e "Baixar meus dados",
 * com a nota de LGPD; "Excluir conta" (Figma 07.09) é a confirmação, aberta pelo botão do
 * rodapé. Mesmo layout nas três plataformas — o quadro é do iPhone, mas a tela nunca teve
 * variante por plataforma e não há indicação de que Android/Web devam divergir aqui.
 *
 * "Baixar meus dados" (spec 039) monta um texto com o que o app já mostra sobre a pessoa
 * (perfil, anúncios, negociações, avaliações) e abre o compartilhamento nativo — sem e-mail
 * nem senha, como a tela já promete. Não é um pedido assíncrono por e-mail como o quadro mais
 * novo do Figma sugere ("enviamos em até 48h"): prometer isso exigiria um envio de e-mail de
 * verdade, que não existe no app hoje (ver spec.md da 039 para o raciocínio completo).
 */
export function PrivacyScreen() {
  const router = useRouter();
  const { confirmar } = useLocalSearchParams<{ confirmar?: string }>();
  const vm = useDeleteAccount({ confirmOnOpen: confirmar === '1' });
  const session = useSessionContext();
  // Esta tela só existe dentro de (app), que já exige sessão — o reserva é só para o TypeScript.
  const exportVm = useExportMyData(
    session.user ?? { id: '', name: '', email: '', emailVerified: false },
  );

  const handleExport = async () => {
    const text = await exportVm.prepare();
    if (!text) return;
    try {
      await Share.share(
        Platform.OS === 'ios'
          ? { message: text }
          : { message: text, title: 'Meus dados do IpêBook' },
      );
    } catch {
      // Cancelar o compartilhamento (ex.: fechar a folha) não é erro; não há o que avisar.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Seus dados</Text>
          <View style={styles.card}>
            <InfoRow
              icon="visibility"
              title="O que aparece no perfil"
              value="Nome e bairro"
              onPress={() => router.push('/escolher-bairro')}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="place"
              title="Localização"
              value="Ao usar o app"
              onPress={() => router.push('/permitir-localizacao')}
            />
            <View style={styles.separator} />
            <InfoRow
              icon="document"
              title="Baixar meus dados"
              onPress={handleExport}
              busy={exportVm.preparing}
            />
          </View>
          <Text style={styles.description}>
            O IpêBook segue a LGPD. Você pode pedir uma cópia ou a exclusão dos seus dados.
          </Text>
          <FormMessage tone="error" message={exportVm.error} />
          <Button label="Excluir conta" variant="danger" onPress={vm.askToDelete} />
        </View>
      </ScrollView>
      <ConfirmDialog
        visible={vm.confirming}
        title="Excluir sua conta?"
        message="Seus anúncios saem do catálogo e o perfil fica indisponível. Não dá para desfazer."
        confirmLabel="Excluir"
        destructive
        onConfirm={vm.confirm}
        onCancel={vm.cancel}
        busy={vm.deleting}
        error={vm.error}
      />
    </SafeAreaView>
  );
}

/** Linha do cartão agrupado: título, valor opcional à direita, seta ou indicador de espera. */
function InfoRow({
  icon,
  title,
  value,
  onPress,
  busy = false,
}: {
  icon: AppIconName;
  title: string;
  value?: string;
  onPress: () => void;
  busy?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={value}
      accessibilityState={{ busy }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed, focused }: { pressed: boolean; focused?: boolean }) => [
        styles.row,
        pressed && !busy && styles.pressed,
        focused && focusRing,
      ]}
    >
      <View style={styles.rowIcon}>
        <AppIcon name={icon} size={18} color={colors.action} />
      </View>
      <Text style={styles.rowTitle}>{title}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {busy ? (
        <ActivityIndicator color={colors.onSurfaceVariant} />
      ) : (
        <AppIcon name="chevronRight" color={colors.onSurfaceVariant} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, padding: metrics.pagePadding },
  content: {
    width: '100%',
    maxWidth: metrics.readingMaxWidth,
    alignSelf: 'center',
    gap: spacing.md,
  },
  sectionLabel: { ...typography.labelLarge, color: colors.onSurfaceVariant },
  // Cartão agrupado do Figma 07.07: linhas com separador, sem o espaço entre cartões de antes.
  card: {
    borderRadius: metrics.cardRadius,
    backgroundColor: colors.containerHigh,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
    marginHorizontal: spacing.md,
  },
  row: {
    minHeight: metrics.touchTarget + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pressed: { backgroundColor: colors.pressed },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.small,
    backgroundColor: colors.selected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { ...typography.bodyLarge, color: colors.onSurface, flex: 1 },
  rowValue: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
  description: { ...typography.bodyMedium, color: colors.onSurfaceVariant },
});
