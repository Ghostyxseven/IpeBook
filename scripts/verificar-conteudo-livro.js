// Executar com MCP Playwright contra a exportação local na porta 8082.
async (page) => {
  // ConteudoLivro(page) {
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('http://localhost:8082/#inicio');
  await page.reload();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Quero comprar', exact: true }).click();
  await page.getByRole('heading', { name: 'Sua próxima leitura pode estar por perto.' }).waitFor();
  await page.getByRole('link', { name: 'IpêBook — início', exact: true }).click();
  await page.getByRole('button', { name: 'Quero vender', exact: true }).click();
  await page.getByRole('heading', { name: 'Abra espaço para o próximo capítulo.' }).waitFor();
  assert(
    (await page
      .getByRole('button', { name: 'Vender', exact: true })
      .getAttribute('aria-pressed')) === 'true',
    'A capa deve abrir o guia de venda',
  );
  for (const label of ['Comprar', 'Trocar', 'Doar', 'Vender']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    assert((await page.locator('.reader-steps li').count()) === 3, 'Três passos por guia');
    assert((await page.locator('.guide-checklist li').count()) === 3, 'Checklist do guia');
  }
  await page.getByRole('button', { name: /Sumário/ }).click();
  const contents = page.getByRole('dialog', { name: 'Sumário', exact: true });
  await contents.waitFor();
  await page.keyboard.press('ArrowLeft');
  assert(page.url().endsWith('#como-funciona'), 'Setas no diálogo não viram a página atrás');
  await page.keyboard.press('Escape');
  assert(
    await page
      .getByRole('button', { name: /Sumário/ })
      .evaluate((el) => el === document.activeElement),
    'Foco deve voltar ao sumário',
  );
  await page.getByRole('button', { name: /Sumário/ }).click();
  await contents.getByRole('link', { name: /A estante de possibilidades/ }).click();
  await page.getByRole('heading', { name: 'Uma estante de possibilidades.' }).waitFor();
  assert((await page.locator('.example-card').count()) === 3, 'Estante inicial com três exemplos');
  for (const label of ['Venda', 'Troca', 'Doação']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    assert((await page.locator('.example-card').count()) === 1, 'Filtrar a modalidade');
    const card = await page.locator('.example-card').innerText();
    if (label === 'Doação')
      assert(card.includes('Grátis') && !card.includes('R$'), 'Doação sem preço');
    if (label === 'Troca')
      assert(
        card.includes('Contos ou poesia') && !card.includes('R$'),
        'Troca com interesse, sem preço',
      );
    await page.getByRole('button', { name: /^Ver exemplo:/ }).click();
    const detail = page.getByRole('dialog');
    await detail.waitFor();
    assert(
      (await detail.innerText()).includes('Exemplo fictício'),
      'Detalhe deve identificar exemplo',
    );
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      assert(
        await page.evaluate(() => Boolean(document.activeElement.closest('dialog'))),
        'Foco preso no diálogo',
      );
    }
    await page.keyboard.press('Escape');
    assert(
      await page
        .getByRole('button', { name: /^Ver exemplo:/ })
        .evaluate((el) => el === document.activeElement),
      'Foco retorna ao livro',
    );
  }
  await page.getByLabel('Buscar nos exemplos').fill('não existe aqui');
  await page.getByRole('heading', { name: 'Nenhum exemplo por aqui.' }).waitFor();
  await page.getByRole('button', { name: 'Limpar busca e filtros' }).click();
  assert((await page.locator('.example-card').count()) === 3, 'Recuperar resultados');
  await page.getByLabel('Buscar nos exemplos').fill('JARDIM');
  assert((await page.locator('.example-card').count()) === 1, 'Busca por título');
  await page.getByRole('button', { name: /^Ver exemplo:/ }).click();
  await page.getByRole('button', { name: 'Entender como vai funcionar' }).click();
  await page.getByRole('heading', { name: 'Sua próxima leitura pode estar por perto.' }).waitFor();
  assert((await page.getByRole('dialog').count()) === 0, 'Fechar detalhe ao navegar ao guia');
  const sizes = [];
  const hashes = [
    'inicio',
    'sobre',
    'como-funciona',
    'em-construcao',
    'duvidas',
    'proximo-capitulo',
    'informacoes',
  ];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width === 768 ? 500 : 844 });
    for (const hash of hashes) {
      await page.evaluate((h) => {
        location.hash = h;
      }, hash);
      await page.waitForFunction(
        (h) => document.querySelector('.book-page.is-current > section')?.id === h,
        hash,
      );
      const size = await page.locator('.book-page.is-current').evaluate((el) => ({
        hash: location.hash,
        width: innerWidth,
        outerWidth: document.documentElement.scrollWidth,
        localWidth: el.clientWidth,
        contentWidth: el.scrollWidth,
        height: innerHeight,
        outerHeight: document.documentElement.scrollHeight,
      }));
      assert(
        size.outerWidth === size.width && size.contentWidth <= size.localWidth,
        `Sem corte horizontal: ${JSON.stringify(size)}`,
      );
      assert(size.outerHeight === size.height, 'Rolagem deve permanecer dentro da folha');
      sizes.push(size);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: /Sumário/ }).click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /A estante de possibilidades/ })
    .click();
  await page.getByLabel('Buscar nos exemplos').fill('');
  await page.getByRole('button', { name: 'Ver exemplo: Um mundo no quintal', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.screenshot({ path: '/tmp/ipe-rich-mobile-detail.png' });
  await page.keyboard.press('Escape');
  assert(errors.length === 0, errors.join(', '));
  return {
    result:
      'Guias, sumário, filtros, busca, vazio, detalhes, foco e 28 combinações de capítulo/viewport aprovados.',
    errors,
    sizes,
  };
};
