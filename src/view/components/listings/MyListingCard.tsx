import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MyListing } from '../../../model/entities/Listing';
import { conditionLabels } from '../../../model/services/catalogFormat';
import { modalityHighlight, myStatusLabels } from '../../../model/services/listingFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';
import { ListingCover } from '../catalog/ListingCover';
import { Button } from '../ui/Button';

/**
 * Um anúncio na Minha estante, com o que dá para fazer com ele.
 *
 * As ações mudam com a situação, e isso é deliberado: um anúncio reservado
 * mostra só o motivo, porque quem manda nele agora é a negociação.
 */
export function MyListingCard({
  listing,
  busy,
  onEdit,
  onArchive,
  onRepublish,
  onRemove,
}: {
  listing: MyListing;
  busy: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRepublish: () => void;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const available = listing.status === 'disponivel';
  const archived = listing.status === 'arquivado';
  const highlight = modalityHighlight(listing);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <ListingCover listing={listing} variant="row" />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {listing.author}
          </Text>
          <Text style={styles.highlight}>{highlight}</Text>
          <Text style={styles.meta}>
            {`${myStatusLabels[listing.status]} · ${conditionLabels[listing.condition]}`}
          </Text>
        </View>
      </View>

      {confirming ? (
        <View style={styles.actions}>
          <Text style={styles.warning} accessibilityLiveRegion="polite">
            Excluir apaga o anúncio e a foto. Não dá para desfazer.
          </Text>
          <Button
            label="Sim, excluir"
            variant="danger"
            disabled={busy}
            onPress={() => {
              setConfirming(false);
              onRemove();
            }}
          />
          <Button
            label="Cancelar"
            variant="text"
            disabled={busy}
            onPress={() => setConfirming(false)}
          />
        </View>
      ) : (
        <View style={styles.actions}>
          {available ? (
            <Button label="Editar" variant="secondary" disabled={busy} onPress={onEdit} />
          ) : null}
          {available ? (
            <Button label="Arquivar" variant="text" disabled={busy} onPress={onArchive} />
          ) : null}
          {archived ? (
            <Button label="Republicar" variant="secondary" disabled={busy} onPress={onRepublish} />
          ) : null}
          {available || archived ? (
            <Button
              label="Excluir"
              variant="danger"
              disabled={busy}
              onPress={() => setConfirming(true)}
            />
          ) : (
            <Text style={styles.locked}>
              Este anúncio está em negociação. Nada muda por aqui até ela terminar.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: metrics.cardRadius,
    borderWidth: metrics.borderThin,
    borderColor: colors.disabledBackground,
    padding: spacing.md,
    gap: spacing.sm,
  },
  top: { flexDirection: 'row', gap: spacing.sm },
  info: { flex: 1, gap: spacing.xxs },
  title: { ...typography.titleMedium, color: colors.text },
  author: { ...typography.bodyMedium, color: colors.secondaryText },
  highlight: { ...typography.labelLarge, color: colors.actionDeep },
  meta: { ...typography.caption, color: colors.secondaryText },
  actions: { gap: spacing.xs },
  warning: { ...typography.bodyMedium, color: colors.error },
  locked: {
    ...typography.bodyMedium,
    color: colors.secondaryText,
    backgroundColor: colors.soft,
    borderRadius: radius.small,
    padding: spacing.xs,
  },
});
