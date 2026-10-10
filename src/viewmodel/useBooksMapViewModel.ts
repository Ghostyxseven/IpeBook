import { useMemo, useState } from 'react';
import type { Listing } from '../model/entities/Listing';
import { publicMapListings } from '../model/services/meetingPoints.ts';
import { cardValue } from '../model/services/catalogFormat.ts';

export function useBooksMapViewModel(items: Listing[]) {
  const [selected, setSelected] = useState<string | null>(null);
  const books = useMemo(() => publicMapListings(items), [items]);
  const groups = useMemo(() => {
    const points = new Map<string, Listing[]>();
    for (const item of books) {
      const p = item.meetingPoint!;
      const key = `${p.longitude},${p.latitude}`;
      points.set(key, [...(points.get(key) ?? []), item]);
    }
    return [...points].map(([id, listings]) => {
      const first = listings[0]!;
      return {
        id,
        latitude: first.meetingPoint!.latitude,
        longitude: first.meetingPoint!.longitude,
        title: first.title,
        coverUrl: first.coverUrl,
        count: listings.length,
        label: `${listings.length > 1 ? `${listings.length} livros` : `${first.title}, ${cardValue(first)}`} — ${first.meetingPoint!.name}`,
        listings,
      };
    });
  }, [books]);
  const markers = useMemo(
    () => groups.map(({ listings: _listings, ...marker }) => marker),
    [groups],
  );
  const chosen = groups.find((group) => group.id === selected);
  return {
    books,
    markers,
    selected,
    select: setSelected,
    visibleBooks: chosen?.listings ?? books,
    selectionName: chosen?.listings[0]?.meetingPoint?.name ?? null,
    clearSelection: () => setSelected(null),
  };
}
