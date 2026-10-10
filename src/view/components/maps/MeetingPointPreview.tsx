import { useState } from 'react';
import { View } from 'react-native';
import type { MeetingPoint } from '../../../model/entities/MeetingPoint';
import { Button } from '../ui/Button';
import { PublicMap } from './PublicMap';

export function MeetingPointPreview({ point }: { point?: MeetingPoint | null }) {
  const [opened, setOpened] = useState(false);
  if (!point) return null;
  return (
    <View>
      <Button
        label={opened ? 'Fechar mapa do encontro' : 'Ver ponto de encontro no mapa'}
        variant="text"
        onPress={() => setOpened((value) => !value)}
      />
      {opened ? <PublicMap point={point} /> : null}
    </View>
  );
}
