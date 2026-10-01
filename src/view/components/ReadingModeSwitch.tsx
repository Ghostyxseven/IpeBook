import type { ReadingMode } from '../../model/entities/BookExperience';
import type { useReadingModePreference } from '../../factories/readingMode';
import { Icon } from './Icon';

type Reading = ReturnType<typeof useReadingModePreference>;

export function ReadingModeSwitch({
  mode,
  modes,
  onChange,
}: {
  mode: ReadingMode;
  modes: Reading['readingModes'];
  onChange: (mode: ReadingMode) => void;
}) {
  return (
    <div className="reading-switch" role="group" aria-label="Modo de leitura">
      {modes.map((item) => (
        <button
          type="button"
          key={item.id}
          aria-pressed={mode === item.id}
          title={item.description}
          onClick={() => onChange(item.id)}
        >
          <Icon name={item.id === 'livro' ? 'book' : 'rows'} size={18} />
          {item.label}
        </button>
      ))}
    </div>
  );
}
