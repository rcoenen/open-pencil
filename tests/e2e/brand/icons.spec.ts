import { expect, test } from '@playwright/test'

import { CanvasHelper } from '#tests/helpers/canvas'

for (const deviceScaleFactor of [1, 2]) {
  test.describe(`brand at ${deviceScaleFactor}x`, () => {
    test.use({ deviceScaleFactor })
    test('the main menu button shows the outlined mark in both app themes', async ({ page }) => {
      await page.goto('/?test')
      await new CanvasHelper(page).waitForInit()
      // The browser header shows the mark as an icon-colored outline, as Figma's main menu does;
      // the ivory tile stays for the app icon, the favicon, and the desktop header.
      const button = page.getByRole('button', { name: 'Main menu', exact: true })
      const mark = button.locator('svg')
      await expect(mark).toHaveCount(1)
      await expect(mark).toHaveCSS('width', '20px')
      for (const appearance of ['light', 'dark'] as const) {
        await page.evaluate(async (appearance) => {
          const path = '/src/app/shell/theme.ts'
          const module = await import(path)
          module.useAppTheme().setTheme(appearance)
        }, appearance)
        const colors = await page.evaluate(() => {
          const root = getComputedStyle(document.documentElement)
          const probe = document.createElement('span')
          document.body.append(probe)
          const resolve = (value: string) => {
            probe.style.color = value
            return getComputedStyle(probe).color
          }
          const muted = resolve(root.getPropertyValue('--color-muted'))
          probe.remove()
          return { muted }
        })
        await expect(mark).toHaveCSS('color', colors.muted)
      }
    })

    test('the 16px favicon keeps its edge-to-edge ivory tile in both browser themes', async ({
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

test('the larger dark SVG retains its palette and subtle grid', async ({ page }) => {
  await page.goto('/brand/mark-dark.svg')
  const mark = page.locator('svg')
  await mark.evaluate((svg) => {
    svg.style.backgroundColor = '#282828'
  })
  await expect(mark).toHaveScreenshot('brand-mark-dark.png')
})

test('the ivory app tile works on light and dark surfaces', async ({ page }) => {
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
