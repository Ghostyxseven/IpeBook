import type { CSSProperties } from 'react';
import tokens from '../../../design-tokens.json';

type TokenTree = { [key: string]: unknown };
function variables(tree: TokenTree, path = ''): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) => {
      if (key.startsWith('$') || key === 'source') return [];
      const name = path ? `${path}-${key}` : key;
      if (value && typeof value === 'object') {
        const token = value as TokenTree;
        return '$value' in token
          ? [[`--${name}`, token.$value as string | number]]
          : Object.entries(variables(token, name));
      }
      return [[`--${name}`, value as string | number]];
    }),
  );
}
export const theme = variables(tokens) as CSSProperties;
