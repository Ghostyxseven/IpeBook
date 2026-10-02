import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Session } from '../../viewmodel/useSession';
import { ErrorState } from '../components/feedback/ErrorState';
import { colors, metrics } from '../theme/nativeTheme';
import { SplashScreen } from './SplashScreen';

/**
 * Enquanto a sessão salva é lida: abertura. Se ela não puder ser confirmada por falta de
 * internet, avisa e oferece nova tentativa, sem mandar para Entrar (issue #34).
 */
export function SessionPendingScreen({ session }: { session: Session }) {
  if (!session.restoreError) return <SplashScreen />;
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ErrorState
          title="Sem conexão"
          message={`Sua sessão continua salva neste aparelho. ${session.restoreError}`}
          onRetry={session.retryRestore}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: metrics.pagePadding,
    width: '100%',
    maxWidth: metrics.formMaxWidth,
    alignSelf: 'center',
  },
});
