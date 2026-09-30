// Executar pelo MCP Playwright com browser_run_code_unsafe({ filename: "scripts/verificar-web.js" }).
// Requer build servido em http://localhost:8082. Não publica nem envia formulários.
async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://localhost:8082');
  await page.waitForLoadState('networkidle');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const widths = [];
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const size = await page.evaluate(() => ({
      width: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert(size.content <= size.width, `Transbordamento em ${width}px`);
    widths.push(size);
  }
  await page.getByRole('button', { name: 'Criar conta', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press(index < 4 ? 'Tab' : 'Shift+Tab');
    assert(
      await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))),
      'Tab e Shift+Tab devem manter o foco no diálogo',
    );
  }
  await page.keyboard.press('Escape');
  assert(!(await page.getByRole('dialog').isVisible()), 'Diálogo deveria fechar');
  assert(
    await page
      .getByRole('button', { name: 'Criar conta', exact: true })
      .evaluate((el) => el === document.activeElement),
    'Foco deveria retornar ao botão',
  );
  await page.getByRole('button', { name: 'Próxima página' }).click();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Próxima página' }).click();
  for (const [hash, title] of [
    ['termos', 'Termos de Uso'],
    ['privacidade', 'Política de Privacidade'],
    ['lgpd', 'Seus direitos e LGPD'],
  ]) {
    await page
      .getByRole('link', { name: hash === 'privacidade' ? 'Privacidade' : title, exact: true })
      .first()
      .click();
    await page.getByRole('heading', { name: title, level: 1 }).waitFor();
    assert(page.url().endsWith(`#${hash}`), 'Endereço legal incorreto');
    await page.reload();
    await page.getByRole('heading', { name: title, level: 1 }).waitFor();
  }
  await page.goBack();
  await page.getByRole('heading', { name: 'Política de Privacidade', level: 1 }).waitFor();
  await page.getByRole('link', { name: 'Voltar à apresentação', exact: false }).click();
  await page
    .getByRole('heading', { level: 1, name: 'Uma boa história merece continuar.' })
    .waitFor();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Abrir sumário', exact: true }).click();
  await page.keyboard.press('Escape');
  assert(
    (await page
      .getByRole('button', { name: 'Abrir sumário', exact: true })
      .getAttribute('aria-expanded')) === 'false',
    'Escape deve fechar o menu',
  );
  await page.getByRole('button', { name: 'Abrir sumário', exact: true }).click();
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  assert(
    await page
      .getByRole('button', { name: 'Abrir sumário', exact: true })
      .evaluate((el) => el === document.activeElement),
    'Foco móvel deve retornar ao menu',
  );
  await page.getByRole('button', { name: 'Abrir sumário', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Navegação principal', exact: true })
    .getByRole('link', { name: 'Como funciona', exact: true })
    .click();
  await page.waitForFunction(() => location.hash === '#como-funciona');
  assert(
    (await page
      .getByRole('button', { name: 'Abrir sumário', exact: true })
      .getAttribute('aria-expanded')) === 'false',
    'Navegação deve fechar o menu',
  );
  await page.getByRole('button', { name: 'Abrir sumário', exact: true }).click();
  await page
    .getByRole('navigation', { name: 'Navegação principal', exact: true })
    .getByRole('link', { name: 'Dúvidas', exact: true })
    .click();
  await page.locator('.book-page.is-current summary').first().focus();
  await page.keyboard.press('Enter');
  assert(
    (await page.locator('details').first().getAttribute('open')) !== null,
    'FAQ deve abrir com teclado',
  );
  const storage = await page.evaluate(() => ({
    cookies: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  assert(
    storage.cookies === '' && storage.local === 0 && storage.session === 0,
    'Não deve gravar armazenamento',
  );
  assert(errors.length === 0, `Erros de página: ${errors.join(', ')}`);
  return {
    widths,
    errors,
    storage,
    result: 'Navegação, histórico, documentos, menu, diálogo e FAQ aprovados.',
  };
};
