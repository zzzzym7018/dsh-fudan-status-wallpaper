# Credits / 来源

## Wallpaper / 壁纸

- The six campus watercolour wallpapers (`assets/fudan-campus-1672.jpg`,
  `assets/fudan-morning-1672.jpg`, `assets/fudan-autumn-1672.jpg`,
  `assets/fudan-sunset-1672.jpg`, `assets/fudan-dusk-1672.jpg`,
  `assets/fudan-moon-1672.jpg`) were supplied by the project owner, derived from
  the four-up contact sheet `assets/fudan-collection-4up.jpg`. Their copyright
  remains with their author; the MIT license below covers the plugin code, not
  this artwork.
- The status-card emblem is the public Fudan University emblem, used for
  personal identification. The emblem is a trademark of Fudan University and is
  not covered by the MIT license.

## Fonts

- The wallpaper image is supplied as a raster; the plugin does not redistribute
  any font files.

## Weather

- [Open-Meteo](https://open-meteo.com/) — free weather data, no key.

## 知行台（本地）

- The local workspace UI and data model are adapted from
  [`zzzzym7018/personal-workflow`](https://github.com/zzzzym7018/personal-workflow),
  used with the project owner's permission. The original project's Next.js /
  Cloudflare Workers / D1 / Sites authentication code is not part of the
  runtime; this plugin ships a local-only adapter with a JSON store.
- The embedded UI bundle is built from `workflow-src/` with React and esbuild.
  No external network requests are made by the local workspace.
