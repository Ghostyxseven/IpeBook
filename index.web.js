// Web: somente a apresentação institucional, sem o Expo Router, para manter o JavaScript
// inicial pequeno (spec 011). O app na Web fica para uma especificação futura (ADR 0005).
import { registerRootComponent } from 'expo';
import InstitutionalScreen from './src/view/screens/InstitutionalScreen.web';

registerRootComponent(InstitutionalScreen);
