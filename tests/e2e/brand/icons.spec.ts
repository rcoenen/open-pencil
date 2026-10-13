import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

for (const deviceScaleFactor of [1, 2]) {
  test.describe(`brand at ${deviceScaleFactor}x`, () => {
    test.use({ deviceScaleFactor })
    test('the editor header shows the modular outline in the text color', async ({ page }) => {
      await page.goto('/?test')
      await new CanvasHelper(page).waitForInit()
      // The kit's modular outline, as UI rather than a tile; the app icon keeps the white tile.
      const logo = page.getByTestId('app-logo')
      await expect(logo).toHaveAttribute('aria-label', 'OpenPencil')
      await expect(logo).toHaveCSS('width', '24px')
      for (const appearance of ['light', 'dark'] as const) {
        await page.evaluate(async (appearance) => {
          const path = '/src/app/shell/theme.ts'
          const module = await import(path)
          module.useAppTheme().setTheme(appearance)
        }, appearance)
        const surface = await page.evaluate(() => {
          const probe = document.createElement('span')
          probe.style.color = getComputedStyle(document.documentElement).getPropertyValue(
            '--color-surface'
          )
          document.body.append(probe)
          const color = getComputedStyle(probe).color
          probe.remove()
          return color
        })
        await expect(logo).toHaveCSS('color', surface)
      }
    })

    test('the 16px favicon keeps its edge-to-edge white tile in both browser themes', async ({
      page,
      baseURL
    }) => {
      const src = new URL('/brand/favicon.svg', baseURL).href
      await page.setContent(`<img src="${src}" alt="OpenPencil favicon" width="16" height="16">`)
      const icon = page.getByRole('img', { name: 'OpenPencil favicon' })
      await icon.evaluate((image: HTMLImageElement) => image.decode())
      for (const colorScheme of ['light', 'dark'] as const) {
        await page.emulateMedia({ colorScheme })
        await icon.evaluate((image, colorScheme) => {
          image.style.colorScheme = colorScheme
          image.style.backgroundColor = colorScheme === 'dark' ? '#282828' : '#ffffff'
        }, colorScheme)
        await expect(icon).toHaveScreenshot(
          `brand-favicon-${colorScheme}-${deviceScaleFactor}x.png`,
          {
            maxDiffPixels: 0,
            threshold: 0.1,
            scale: 'device'
          }
        )
      }
    })
  })
}

test('the main SVG retains its approved appearance', async ({ page }) => {
  await page.goto('/brand/mark.svg')
  await expect(page.locator('svg')).toHaveScreenshot('brand-mark.png')
})

test('the larger dark SVG keeps the colour mark on a dark surface', async ({ page }) => {
  await page.goto('/brand/mark-dark.svg')
  const mark = page.locator('svg')
  await mark.evaluate((svg) => {
    svg.style.backgroundColor = '#282828'
  })
  await expect(mark).toHaveScreenshot('brand-mark-dark.png')
})

test('the white app tile works on light and dark surfaces', async ({ page }) => {
  await page.goto('/brand/app-icon.svg')
  const icon = page.locator('svg').first()
  for (const appearance of ['light', 'dark'] as const) {
    await icon.evaluate((svg, appearance) => {
      svg.setAttribute('width', '128')
      svg.setAttribute('height', '128')
      svg.style.backgroundColor = appearance === 'dark' ? '#282828' : '#ffffff'
    }, appearance)
    await expect(icon).toHaveScreenshot(`brand-app-icon-${appearance}.png`)
  }
})

test('browser icon declarations resolve without a duplicate manifest', async ({
  page,
  request
}) => {
  await page.goto('/?test')
  const icons = page.locator('link[rel="icon"], link[rel="apple-touch-icon"]')
  const paths = await icons.evaluateAll((links) => links.map((link) => link.getAttribute('href')))
  expect(paths).toEqual(
    expect.arrayContaining(['/favicon.ico', '/brand/favicon.svg', '/apple-touch-icon.png'])
  )
  for (const path of paths) {
    expect(path).toBeTruthy()
    if (!path) continue
    const response = await request.get(path)
    expect(response.ok()).toBe(true)
    expect(response.headers()['content-type']).not.toContain('text/html')
  }
  // The dev server deliberately disables PWA registration; production injects one manifest.
  expect(await page.locator('link[rel="manifest"]').count()).toBeLessThanOrEqual(1)
})
