import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { webWindowClass } from '../src/view/hooks/webWindowClass.ts';
import { activeWebSection } from '../src/view/components/webNavigationState.ts';

const tokens = JSON.parse(readFileSync(new URL('../design-tokens.json', import.meta.url), 'utf8'));
const dimensions = tokens.app.web;
const px = (token) => Number.parseFloat(token.$value);
const breakpoints = {
  medium: px(dimensions.mediumBreakpoint),
  expanded: px(dimensions.expandedBreakpoint),
  large: px(dimensions.largeBreakpoint),
};

test('classes de janela seguem os limites do design system sem mudar o layout nativo', () => {
  assert.equal(webWindowClass(599, true, breakpoints), 'compact');
  assert.equal(webWindowClass(600, true, breakpoints), 'medium');
  assert.equal(webWindowClass(839, true, breakpoints), 'medium');
  assert.equal(webWindowClass(840, true, breakpoints), 'expanded');
  assert.equal(webWindowClass(1199, true, breakpoints), 'expanded');
  assert.equal(webWindowClass(1200, true, breakpoints), 'large');
  assert.equal(webWindowClass(1600, false, breakpoints), 'compact');
});

test('navegação Web mantém a seção ativa nas telas internas', () => {
  assert.equal(activeWebSection('/app/livro/123'), 'explorar');
  assert.equal(activeWebSection('/anunciar/123'), 'estante');
  assert.equal(activeWebSection('/negociacoes/123/conversa'), 'conversas');
  assert.equal(activeWebSection('/configuracoes'), 'perfil');
  assert.equal(activeWebSection('/rota-desconhecida'), null);
});
