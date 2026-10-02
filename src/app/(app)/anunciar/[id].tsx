import { useLocalSearchParams } from 'expo-router';
import { EditListingScreen } from '../../../view/screens/listings/EditListingScreen';

export default function EditListingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditListingScreen id={id} />;
}
