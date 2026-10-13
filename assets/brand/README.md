# OpenPencil brand sources

Logo kit v3: a P built from five modules on a 2 × 3 grid of equal square cells, in flat colour.

- `mark.svg` is the colour mark. Every rounded corner uses the same radius, half a cell. The counter is a cut-out with one sharp corner, centred where the four top modules meet. The coral foot is the pencil.
- `mark-micro.svg` is the same artwork at 16px, for favicons. The kit has no separate small drawing: below 24px it prefers the one-colour mark, which the generator derives.
- Both draw the 200 × 300 mark centred on a square `0 0 300 300` canvas, so the generator can place them like any square artwork. Keep the two files' geometry identical.
- Each module carries a `data-part` (`stem-top`, `bowl-top`, `stem-middle`, `bowl-bottom`, `foot`). The hidden `data-shape="silhouette"` path is the whole P as one shape: the one-colour variants draw it in place of the modules, whose shared edges would otherwise show seams.

| Module       | `data-part`   | Name  | Hex       |
| ------------ | ------------- | ----- | --------- |
| Top left     | `stem-top`    | Blue  | `#1D46D6` |
| Top right    | `bowl-top`    | Azure | `#4DA3FF` |
| Middle left  | `stem-middle` | Teal  | `#0B8A84` |
| Middle right | `bowl-bottom` | Mint  | `#3EDBB0` |
| Foot         | `foot`        | Coral | `#FF6B3D` |
| One colour   | —             | Ink   | `#111111` |

Each row is a dark-to-light pair, the hue walks from blue to teal down the mark, and coral is the only warm colour. Flat colour only: no gradients, shadows, or outlines on the colour mark.

## Backgrounds and tiles

The colour mark sits bare on white, black, and neutral greys, so the dark variants keep its colours. On colour or busy backgrounds, use the white tile or the one-colour mark, and never place the bare colour mark on one of its module colours. The one-colour mark is ink on light backgrounds and white on dark ones.

The app icon is the colour mark on a white rounded tile, holding the mark at 76% of the tile's height. The same tile is the favicon in both browser themes, the any-purpose PWA icon, the profile image, and the desktop app's 24px rail mark. Native desktop icons keep their platform-specific outer margin with the mark at the same share of the tile. Apple Touch keeps an opaque square for platform rounding; maskable artwork stays opaque and inside the central 80%-diameter safe circle.

`icons/mark-modular.svg` is the kit's modular outline: the P and the lines between its modules, drawn with `currentColor` on a 24px grid with a 1.5px line. The browser's main-menu button at the top of the navigation rail shows it in the text color, as Figma shows its logo; Vite serves `icons/` as the `brand` icon collection (`<icon-brand-mark-modular />`). The kit recommends it from 48px and its single-line UI icon below that.

Minimum sizes: the colour mark 24px tall; the one-colour mark 16px. Keep half a module, a quarter of the mark's width, clear on every side.

Edit these SVGs, not generated files. Platform backgrounds, padding, and the one-colour ink live in `tools/generate/brand/src/config.ts`.

## Generation

```sh
bun run generate:icons                    # All targets
bun run generate:icons --target web       # App/browser/PWA
bun run generate:icons --target docs      # Documentation
bun run generate:icons --target desktop   # Native PNG/ICO/ICNS
bun run generate:icons --force            # Ignore the content cache
bun run check:icons                       # Fresh generation, contracts, reproducibility, types
bun test tools/generate/brand/tests
```

Generation is local using pinned RealFaviconGenerator/Sharp and Tauri versions; no hosted generator or credentials are needed. Generated assets and the cache are ignored by Git. Only the two artwork masters, settings, code, tests, and the normal Playwright visual baseline are tracked.

Vite ensures web assets before app dev/build. VitePress ensures docs assets before docs dev/build. Storybook prepares the assets for its stories. Tauri's dev/build hooks prepare native icons before compilation. Direct Cargo commands bypass those hooks: run `bun run generate:icons --target desktop` before `cargo check` or `cargo build` on a fresh checkout. CI's native-contract job does this explicitly. No icon generation runs in the shipped application.

Outputs are owned by `tools/generate/brand/src/config.ts`: `public/brand/`, `packages/docs/public/brand/`, the root ICO/Apple Touch files in each public directory, and `desktop/icons/`. The app's manifest remains in `vite/pwa.ts`; docs intentionally do not receive an installable-app manifest. Web assets never symlink into desktop output.

Preparation fingerprints the artwork, generator code/settings, lockfile and runtime/tool versions, verifies output hashes, and skips unchanged targets. Missing or corrupted outputs regenerate. A cross-process lock serializes concurrent builds; each file is published atomically and the cache is written last. Destination symlinks are rejected. Native ICNS frame ordering is normalized without re-encoding images.

## Review

Use the **Brand/Mark** Storybook stories for the colour, micro, and one-colour appearances. `tests/e2e/brand/icons.spec.ts` checks the browser assets, app theme selection, and the main mark's visual baseline. Review intentional changes before updating its snapshot. Run at actual 16/24/32 pixel sizes as well as large sizes.

Do not mechanically replace generic pencil/tool icons or historical screenshots. Social artwork, external profile avatars, and Apple Icon Composer layered icons are separate design/export tasks.
