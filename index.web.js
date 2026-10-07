// Web: por padrão, só a apresentação institucional, sem o Expo Router, para manter o JavaScript
// inicial pequeno (spec 011, ADR 0005). Com EXPO_PUBLIC_WEB_APP=1 o mesmo projeto exporta o app
// completo, servido em /app (ADR 0025). A variável é fixada no build, e o ramo não usado sai do pacote.
import { registerRootComponent } from 'expo';

if (process.env.EXPO_PUBLIC_WEB_APP === '1') {
  // O index.html é o da apresentação, que não dá altura ao #root; as telas do app usam flex: 1.
  const style = document.createElement('style');
  style.textContent = 'html,body,#root{height:100%}body{overflow:hidden}';
  document.head.appendChild(style);
  require('expo-router/entry');
} else {
  registerRootComponent(require('./src/view/screens/InstitutionalScreen.web').default);
}
