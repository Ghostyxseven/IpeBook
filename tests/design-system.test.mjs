import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const tokens = JSON.parse(readFileSync(new URL('../design-tokens.json', import.meta.url), 'utf8'));

test('design system mantém tokens fundamentais e compatíveis', () => {
  assert.equal(tokens.color.action.$value, '#2C5E45');
  assert.equal(tokens.color.background.$value, '#F6F1E8');
  assert.equal(tokens.platform.web.controlHeight.$value, '48px');
  assert.equal(tokens.spacing['24'].$value, '24px');
  assert.equal(tokens.typography.body.fontSize.$value, '16px');
});

test('design system inclui foundations da versão 1.1', () => {
  assert.equal(tokens.source.version, '1.1');
  assert.equal(tokens.layout.web.columns.$value, 12);
  assert.equal(tokens.layout.web.contentWidth.$value, '1280px');
  assert.equal(tokens.accessibility.touchTarget.$value, '48px');
  assert.equal(tokens.border.thin.$value, '1px');
  assert.equal(tokens.opacity.disabledContent.$value, 0.38);
  assert.equal(tokens.motion.duration.standard.$value, '250ms');
  assert.deepEqual(tokens.motion.easing.standard.$value, [0.2, 0, 0, 1]);
});

test('design system cobre estados de produto', () => {
  assert.equal(tokens.color.badge.sale.text.$value, '#18291F');
  assert.equal(tokens.color.badge.trade.text.$value, '#3A2A10');
  assert.equal(tokens.color.badge.donation.text.$value, '#6E3A28');
  assert.equal(tokens.color.badge.reserved.text.$value, '#3C302A');
  assert.equal(tokens.color.badge.completed.text.$value, '#FFFFFF');
});

test('tokens globais usam objetos tipados com $value', () => {
  const groups = [
    tokens.color,
    tokens.spacing,
    tokens.radius,
    tokens.border,
    tokens.opacity,
    tokens.motion,
    tokens.layout,
    tokens.accessibility,
    tokens.platform,
    tokens.typography,
    tokens.landing,
  ];

  const validate = (node) => {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      assert.ok(value && typeof value === 'object', `Token/grupo inválido em ${key}`);
      if ('$value' in value) {
        assert.ok('$type' in value, `Token ${key} precisa declarar $type`);
      } else {
        validate(value);
      }
    }
  };

  for (const group of groups) validate(group);
});

test('Liquid Glass traz os tokens da referência, sem inventar valor', () => {
  // Os valores vêm de docs/design-system/referencia/tokens.json, em hex com alfa:
  // rgba(252, 250, 245, 0.58) → #FCFAF594, e assim por diante.
  assert.equal(tokens.color.ios.glassFill.$value, '#FCFAF594');
  assert.equal(tokens.color.ios.glassStroke.$value, '#FFFFFFBF');
  assert.equal(tokens.color.ios.glassFillDark.$value, '#1E1E1E6B');
  // A receita: desfoque de 22pt, saturação de 180% e borda de 0,5pt.
  assert.equal(tokens.platform.ios.glassBlur.$value, 22);
  assert.equal(tokens.platform.ios.glassSaturation.$value, 180);
  assert.equal(tokens.border.hairline.$value, '0.5px');
  // O vidro é só do iPhone: Android e Web não ganham token de vidro.
  assert.equal(tokens.platform.android.glassBlur, undefined);
  assert.equal(tokens.platform.web.glassBlur, undefined);
});
