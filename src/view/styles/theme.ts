import type { CSSProperties } from 'react';
import tokens from '../../../design-tokens.json';

type TokenTree = { [key: string]: unknown };
type CssValue = string | number;

function cssValue(value: unknown): CssValue {
  if (Array.isArray(value) && value.length === 4 && value.every((item) => typeof item === 'number')) {
    return `cubic-bezier(${value.join(', ')})`;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  return String(value);
}

function variables(tree: TokenTree, path = ''): Record<string, CssValue> {
  return Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) => {
      if (key.startsWith('$') || key === 'source') return [];

      const name = path ? `${path}-${key}` : key;

      if (value && typeof value === 'object') {
        const token = value as TokenTree;

        return '$value' in token
          ? [[`--${name}`, cssValue(token.$value)]]
          : Object.entries(variables(token, name));
      }

      return [[`--${name}`, cssValue(value)]];
    }),
  );
}

export const theme = variables(tokens) as CSSProperties;
