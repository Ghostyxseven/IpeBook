import { SafeAreaView } from 'react-native-safe-area-context';
import { BookRequestListScreen } from '../../../view/screens/negotiation/BookRequestListScreen';
import { colors } from '../../../view/theme/nativeTheme';

/** Aba Conversas (Figma, navegação principal): as negociações da pessoa. */
export default function ConversasTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }} edges={['top']}>
      <BookRequestListScreen />
    </SafeAreaView>
  );
}
