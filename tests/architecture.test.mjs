import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Lista os arquivos .ts e .tsx de uma pasta, recursivamente. */
function sources(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sources(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

const importsOf = (file) =>
  [...readFileSync(file, 'utf8').matchAll(/(?:from\s+|import\s+)['"]([^'"]+)['"]/g)].map(
    (match) => match[1],
  );

test('Model não depende de React, React Native nem Expo (ADR 0002 e ADR 0012, #33)', () => {
  const forbidden = /^(react|react-native|react-dom|expo|expo-[\w-]+|@expo\/)(\/|$)/;
  const offenders = sources('src/model').flatMap((file) =>
    importsOf(file)
      .filter((specifier) => forbidden.test(specifier))
      .map((specifier) => `${file} → ${specifier}`),
  );
  assert.deepEqual(offenders, []);
});

test('Views e rotas não importam repositórios nem a infraestrutura (ADR 0002 e ADR 0012)', () => {
  const offenders = [...sources('src/view'), ...sources('src/app')].flatMap((file) =>
    importsOf(file)
      .filter((specifier) => /model\/repositories\/|\/infra\//.test(specifier))
      .map((specifier) => `${file} → ${specifier}`),
  );
  assert.deepEqual(offenders, []);
});
