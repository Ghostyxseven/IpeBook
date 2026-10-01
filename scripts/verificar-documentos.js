// Executar pelo MCP Playwright: browser_run_code_unsafe({ filename: "scripts/verificar-documentos.js" }).
// Servidor local: npm run web -- --port 8082. Não envia dados ou publica conteúdo.
async (page) => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(message);
  };
  const pages = ['privacidade', 'seguranca', 'termos', 'lgpd'];
  const results = [];
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of pages) {
      await page.goto(`http://localhost:8082/#${id}`);
      await page.locator('.legal-article h1').waitFor();
      const geometry = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        links: [...document.querySelectorAll('[aria-label="Documentos legais"] a')].map((el) => {
          const rect = el.getBoundingClientRect();
          return { height: rect.height, left: rect.left, right: rect.right };
        }),
        bodySize: parseFloat(getComputedStyle(document.querySelector('.legal-topic p')).fontSize),
      }));
      assert(!geometry.overflow, `Transbordamento: ${id}, ${width}`);
      assert(geometry.bodySize >= 16, `Fonte pequena: ${id}`);
      assert(
        geometry.links.every((link) => link.height >= 48 && link.left >= 0 && link.right <= width),
        'Links devem ficar visíveis e ter alvo de 48 px',
      );
      const index = page.locator('.legal-index summary');
      await index.focus();
      await page.keyboard.press('Enter');
      const shortcuts = page
        .getByRole('navigation', { name: 'Assuntos desta página' })
        .getByRole('button');
      const count = await shortcuts.count();
      for (let i = 0; i < count; i++) {
        await shortcuts.nth(i).click();
        const target = page.locator(`#${id}-assunto-${i}`);
        assert(
          await target.evaluate((el) => el === document.activeElement),
          'Atalho precisa mover o foco',
        );
        const visible = await target.evaluate(
          (el) =>
            el.getBoundingClientRect().top >=
            document.querySelector('.site-header').getBoundingClientRect().bottom,
        );
        assert(visible, 'Título encoberto pelo cabeçalho');
        assert(page.url().endsWith(`#${id}`), 'Atalho não deve mudar a rota');
        await page.locator('.legal-return').nth(i).click();
        assert(
          await index.evaluate((el) => el === document.activeElement),
          'Retorno precisa focar o índice',
        );
      }
      await page.reload();
      await page.locator('.legal-article h1').waitFor();
      assert(page.url().endsWith(`#${id}`), 'Recarga deve preservar documento');
      if (width === 390 || width === 1440) {
        await page.screenshot({ path: `.playwright-mcp/${id}-${width}.png` });
      }
      results.push({ page: id, width, topics: count });
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:8082/privacidade');
  await page
    .getByRole('navigation', { name: 'Documentos legais' })
    .getByRole('link', { name: 'Segurança' })
    .click();
  await page.getByRole('heading', { name: 'Segurança', exact: true }).waitFor();
  await page.goBack();
  await page.getByRole('heading', { name: 'Política de Privacidade', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Voltar à apresentação', exact: false }).click();
  await page.locator('.book-presentation').waitFor();
  assert(errors.length === 0, JSON.stringify(errors));
  return { results, errors, history: 'Troca, Voltar e retorno à apresentação aprovados' };
};
