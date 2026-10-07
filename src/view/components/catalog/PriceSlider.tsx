import { useRef, useState } from 'react';
import {
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import {
  MAX_PRICE_CENTS,
  PRICE_STEP_CENTS,
  maxPriceLabel,
} from '../../../model/services/catalogFilters';
import { formatBRL } from '../../../model/services/catalogFormat';
import { colors, metrics, radius, spacing, typography } from '../../theme/nativeTheme';

const ios = Platform.OS === 'ios';
const THUMB = 28;
const TRACK = 6;

/** O fim da faixa não é um teto: é "sem teto". Assim o padrão do filtro fica à direita. */
function toCents(position: number): number | null {
  return position >= MAX_PRICE_CENTS ? null : position;
}

function toPosition(cents: number | null): number {
  return cents == null ? MAX_PRICE_CENTS : cents;
}

/**
 * Preço máximo da tela Filtrar livros (Figma 02.03). Controle próprio, como o resto dos
 * controles do app (ADR 0013): não há slider no React Native sem dependência nova.
 *
 * É "ajustável" para o leitor de tela, que anuncia o valor e muda de R$ 5 em R$ 5 com os
 * gestos de incremento; na Web as setas do teclado fazem o mesmo. Arrastar ou tocar na
 * trilha também vale, e o alvo tem 48 px de altura mesmo com a trilha de 6 px.
 */
export function PriceSlider({
  value,
  onChange,
}: {
  /** Teto em centavos; `null` não limita. */
  value: number | null;
  onChange: (cents: number | null) => void;
}) {
  const [width, setWidth] = useState(0);
  // O PanResponder é criado uma vez; a largura e o retorno atuais vêm por referência.
  const latest = useRef({ width, onChange });
  latest.current = { width, onChange };

  const position = toPosition(value);
  const ratio = MAX_PRICE_CENTS > 0 ? position / MAX_PRICE_CENTS : 0;

  const moveTo = (x: number) => {
    const track = latest.current.width;
    if (track <= 0) return;
    const clamped = Math.min(Math.max(x, 0), track);
    const raw = (clamped / track) * MAX_PRICE_CENTS;
    const stepped = Math.round(raw / PRICE_STEP_CENTS) * PRICE_STEP_CENTS;
    const next = Math.min(Math.max(stepped, PRICE_STEP_CENTS), MAX_PRICE_CENTS);
    latest.current.onChange(toCents(next));
  };

  // O ponto onde o dedo encostou; o arrasto anda a partir dele, sem depender do alvo.
  const startX = useRef(0);
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event) => {
        startX.current = event.nativeEvent.locationX;
        moveTo(startX.current);
      },
      onPanResponderMove: (_event, gesture) => moveTo(startX.current + gesture.dx),
    }),
  ).current;

  const step = (direction: 1 | -1) => {
    const next = position + direction * PRICE_STEP_CENTS;
    const clamped = Math.min(Math.max(next, PRICE_STEP_CENTS), MAX_PRICE_CENTS);
    onChange(toCents(clamped));
  };

  const label = maxPriceLabel(value);
  // Na Web, setas e Home/End ajustam o valor sem o mouse.
  const keyboard =
    Platform.OS === 'web'
      ? {
          // `focusable` está deprecado no react-native-web; `tabIndex` é o substituto.
          tabIndex: 0 as const,
          onKeyDown: (event: { key: string; preventDefault: () => void }) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowUp') step(1);
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') step(-1);
            else if (event.key === 'Home') onChange(PRICE_STEP_CENTS);
            else if (event.key === 'End') onChange(null);
            else return;
            event.preventDefault();
          },
        }
      : null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.values}>
        <Text style={styles.floor}>{formatBRL(0)}</Text>
        <Text style={styles.current}>{label}</Text>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Preço máximo"
        accessibilityValue={{
          min: PRICE_STEP_CENTS,
          max: MAX_PRICE_CENTS,
          now: position,
          text: label,
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(event) => {
          if (event.nativeEvent.actionName === 'increment') step(1);
          if (event.nativeEvent.actionName === 'decrement') step(-1);
        }}
        onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)}
        style={styles.target}
        {...keyboard}
        {...pan.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
          <View
            style={[
              styles.thumb,
              // Recua meio polegar para a bolinha parar dentro da trilha nas duas pontas.
              { left: `${ratio * 100}%`, marginLeft: -THUMB / 2 },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  values: { flexDirection: 'row', alignItems: 'baseline' },
  floor: {
    ...(ios ? typography.iosFootnote : typography.bodyMedium),
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  current: {
    ...(ios ? typography.iosSubheadline : typography.labelLarge),
    fontWeight: '600',
    color: colors.action,
  },
  // Trilha de 6 px dentro de um alvo de 48 px, como as "Áreas de toque" do Figma.
  target: { height: metrics.touchTarget, justifyContent: 'center' },
  track: {
    height: TRACK,
    borderRadius: TRACK / 2,
    backgroundColor: colors.containerHigh,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    height: TRACK,
    borderRadius: TRACK / 2,
    backgroundColor: colors.action,
  },
  thumb: {
    position: 'absolute',
    // Centrado na trilha: metade da diferença entre a bolinha e os 6 px da trilha.
    top: -(THUMB - TRACK) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: radius.full,
    backgroundColor: colors.containerLowest,
    borderWidth: metrics.borderThin,
    borderColor: colors.outlineVariant,
  },
});
