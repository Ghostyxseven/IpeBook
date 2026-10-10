import { Platform, useWindowDimensions } from 'react-native';
import { webLayout } from '../theme/nativeTheme';
import { webWindowClass } from './webWindowClass';

/** Classe de janela só para composição da View; Android e iOS mantêm seu layout atual. */
export function useWebLayout() {
  const { width } = useWindowDimensions();
  const web = Platform.OS === 'web';
  const windowClass = webWindowClass(width, web, webLayout);
  return {
    web,
    medium: windowClass !== 'compact',
    expanded: windowClass === 'expanded' || windowClass === 'large',
    large: windowClass === 'large',
  };
}
