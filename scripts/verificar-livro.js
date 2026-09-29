// Executar pelo MCP Playwright; usa a exportação Web servida localmente na porta 8081.
async function verificarLivro(page) {
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:8081/#inicio');
  await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const sizes = [];
  for (const width of [320, 390, 768, 1440, 1778]) {
    await page.setViewportSize({ width, height: 844 });
    sizes.push(
      await page.evaluate(() => ({
        width: innerWidth,
        actual: document.documentElement.scrollWidth,
        height: innerHeight,
        actualHeight: document.documentElement.scrollHeight,
      })),
    );
  }
  assert(
    sizes.every((s) => s.width === s.actual && s.height === s.actualHeight),
    'A apresentação deve caber no viewport',
  );
  for (let index = 1; index < 7; index++) {
    await page.getByRole('button', { name: 'Próxima página' }).click();
    await page.waitForFunction(
      (i) =>
        document
          .querySelector('.book-counter')
          ?.textContent?.startsWith(String(i + 1).padStart(2, '0')),
      index,
    );
    assert((await page.locator('.book-page.is-current').count()) === 1, 'Uma única folha ativa');
    assert((await page.locator('.book-page[inert]').count()) === 6, 'Folhas ocultas inertes');
  }
  assert(await page.getByRole('button', { name: 'Próxima página' }).isDisabled(), 'Fim do livro');
  await page.getByRole('link', { name: 'Privacidade', exact: true }).click();
  await page.getByRole('heading', { name: 'Política de Privacidade', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'Política de Privacidade', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Voltar à apresentação', exact: false }).click();
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  assert(!(await page.getByRole('dialog').isVisible()), 'Diálogo fecha');
  await page.getByRole('link', { name: 'Dúvidas', exact: true }).click();
  await page.locator('.book-page.is-current summary').first().focus();
  await page.keyboard.press('Enter');
  assert((await page.locator('details[open]').count()) === 1, 'FAQ acessível');
  await page.locator('.book-page.is-current').focus();
  await page.keyboard.press('ArrowLeft');
  await page.waitForFunction(() => location.hash === '#em-construcao');
  await page.goBack();
  await page.waitForFunction(() =>
    document.querySelector('.book-counter')?.textContent?.startsWith('05'),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.book-stage').evaluate((element) => {
    element.dispatchEvent(
      new TouchEvent('touchstart', {
        bubbles: true,
        touches: [new Touch({ identifier: 1, target: element, clientX: 300, clientY: 400 })],
      }),
    );
    element.dispatchEvent(
      new TouchEvent('touchend', {
        bubbles: true,
        changedTouches: [new Touch({ identifier: 1, target: element, clientX: 80, clientY: 410 })],
      }),
    );
  });
  await page.waitForFunction(() =>
    document.querySelector('.book-counter')?.textContent?.startsWith('06'),
  );
  assert((await page.locator('.book-strip').count()) === 0, 'Movimento reduzido sem rotação');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Página anterior' }).click();
  await page.waitForTimeout(1200);
  assert((await page.locator('.book-strip').count()) === 0, 'Limpar animação concluída');
  await page.getByRole('button', { name: 'Próxima página' }).click();
  await page.getByRole('button', { name: 'Página anterior' }).click();
  await page.waitForTimeout(1200);
  assert((await page.locator('.book-strip').count()) === 0, 'Cliques rápidos não deixam clones');
  assert(errors.length === 0, errors.join(', '));
  return {
    sizes,
    errors,
    result:
      'Livro, limites, documentos, diálogo, FAQ, teclado, histórico, gesto e movimento reduzido aprovados.',
  };
}

module.exports = { verificarLivro };
