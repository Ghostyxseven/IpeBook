/** Verifica a entrega HTTP da exportação, sem dependências nem Playwright. */
import assert from 'node:assert/strict';
const base = process.env.IPEBOOK_TEST_URL || 'http://127.0.0.1:8089';
const htmlResponse = await fetch(base);
assert.equal(htmlResponse.status, 200);
const html = await htmlResponse.text();
const viewport = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/i)?.[1];
assert.ok(viewport, 'viewport presente');
assert.doesNotMatch(viewport, /user-scalable\s*=\s*(?:0|no)|maximum-scale\s*=/i);
assert.match(html, /Roboto-pt-br\.woff2/);
assert.doesNotMatch(html, /Roboto\.ttf/);
const robots = await fetch(`${base}/robots.txt`);
assert.equal(robots.status, 200);
assert.match(robots.headers.get('content-type'), /text\/plain/);
const directives = (await robots.text()).trim().split('\n');
assert.ok(directives.some((line) => /^User-agent:\s*\*/i.test(line)));
assert.ok(directives.every((line) => /^(?:User-agent|Allow|Disallow|Sitemap):/i.test(line)));
const llms = await fetch(`${base}/llms.txt`);
assert.equal(llms.status, 200);
assert.match(llms.headers.get('content-type'), /text\/plain/);
const markdown = await llms.text();
assert.match(markdown, /^# IpêBook/m);
assert.doesNotMatch(markdown, /<!doctype|<html/i);
for (const [, target] of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
  const response = await fetch(new URL(target, base));
  assert.equal(response.status, 200, `link acessível: ${target}`);
}
for (const path of [
  '/ai-catalog.json',
  '/.well-known/ai-catalog.json',
  '/arquivo-inexistente.txt',
]) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 404, `${path} não pode cair no HTML da apresentação`);
}
const font = await fetch(`${base}/fonts/Roboto-pt-br.woff2`);
assert.equal(font.status, 200);
const fontBytes = new Uint8Array(await font.arrayBuffer());
assert.equal(new TextDecoder().decode(fontBytes.slice(0, 4)), 'wOF2');
console.log(
  'OK: zoom habilitado, WOFF2 servido, robots/llms válidos e arquivos ausentes com HTTP 404.',
);
