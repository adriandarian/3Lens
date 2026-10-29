async page => {
  const destination = 'C:/Users/hello/Projects/3Lens/output/design-evaluation/light-v2';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1774, height: 887 });
  await page.locator('.tlp-workspace').waitFor();
  const results = [];
  for (const tool of ['Inspect', 'Performance', 'Memory', 'Changes', 'Shaders', 'Surfaces']) {
    await page.goto('http://localhost:3000/?light-check=' + tool);
    await page.locator('.tlp-workspace').waitFor();
    await page.getByRole('tab', { name: tool, exact: true }).or(page.getByRole('button', { name: tool, exact: true })).first().click();
    await page.waitForTimeout(150);
    const colors = await page.locator('.tlp-workspace').evaluate(root => {
      const style = getComputedStyle(root);
      return { scheme: style.colorScheme, background: style.backgroundColor, foreground: style.color };
    });
    if (colors.scheme !== 'light' || colors.background !== 'rgb(250, 250, 250)') {
      throw new Error(`${tool} does not default to light: ${JSON.stringify(colors)}`);
    }
    await page.screenshot({ path: `${destination}/${tool.toLowerCase()}.png` });
    results.push({ tool, ...colors });
  }
  await page.goto('http://localhost:3000/');
  await page.getByRole('tab', { name: 'Inspect', exact: true }).or(page.getByRole('button', { name: 'Inspect', exact: true })).first().click();
  await page.keyboard.press('Control+k');
  await page.locator('.tlp-command').waitFor();
  await page.screenshot({ path: `${destination}/command-menu.png` });
  await page.keyboard.press('Escape');
  if (errors.length) throw new Error(errors.join('\n'));
  return { passed: true, screens: results, browserExceptions: errors };
}



