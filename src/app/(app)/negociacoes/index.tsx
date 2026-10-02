import { BookRequestListScreen } from '../../../view/screens/negotiation/BookRequestListScreen';

/** Pela pilha (por exemplo a partir do Detalhe), o cabeçalho já mostra "Conversas". */
export default function NegociacoesRoute() {
  return <BookRequestListScreen showTitle={false} />;
}
