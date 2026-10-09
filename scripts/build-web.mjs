/** Exporta a apresentação em dist/ e o app em dist/app/ (ADR 0025). Funciona em qualquer sistema. */
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';

const expo = (env, ...args) =>
  execFileSync('npx', ['expo', 'export', '--platform', 'web', ...args], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });

expo({ EXPO_PUBLIC_WEB_APP: '0' });
expo({ EXPO_PUBLIC_WEB_APP: '1' }, '--output-dir', 'dist/app', '--clear');
// Estes arquivos descrevem o site e só valem na raiz.
for (const file of ['robots.txt', 'llms.txt']) rmSync(`dist/app/${file}`, { force: true });
console.log('Web exportada: apresentação em dist/ e app em dist/app/.');
