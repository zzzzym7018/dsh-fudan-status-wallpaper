# Publishing to the DSH plugin market

The market is **not** a file-upload portal. It is the curated
[`awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin)
list; entries are added by pull request, and the storefront reads the public
GitHub repository. The repository must declare `dsh.bundle` (this one does) and
must be at least **one day old** before the submission CI accepts it.

## 1. Public GitHub repository (required)

Repository: `zzzzym7018/dsh-fudan-status-wallpaper` (already created; code pushed).

```sh
# from this directory, with the package at the repository root
git init
git add .
git commit -m "feat: Fudan status bar & wallpaper plugin 2.0.0"
git branch -M main
git remote add origin git@github.com:zzzzym7018/dsh-fudan-status-wallpaper.git
git push -u origin main
```

Then add the GitHub topic `dsh-plugin` and wait at least 24 hours.

The repo already contains `assets/icon-180.png`, `assets/screenshot-wallpaper.jpg`,
`screenshots.json` and the full-resolution wallpaper. Node dependencies are
not needed: the plugin is plain JavaScript and has no build step.

## 2. npm (optional)

npm is optional; GitHub installs are enough. `dsh-quota-wallpaper` is not taken
on npm at the time of writing. To publish:

```sh
npm login
npm publish --access public
```

The 2.0.0 tarball is already built at `dist/dsh-quota-wallpaper-2.0.0.tgz`
(`npm pack --cache /tmp/dsh-npm-cache --pack-destination dist`).

## 3. Marketplace entry (the actual submission)

Fork `awesome-dsh-plugin`, then add **one file**:
`data/plugins/zzzzym7018__dsh-fudan-status-wallpaper.yml`

```yaml
url: https://github.com/zzzzym7018/dsh-fudan-status-wallpaper
name: zzzzym7018/dsh-fudan-status-wallpaper
category: ui
description:
  en: 'Fudan-themed DeepSeek quota and campus-weather status card with a draggable layout, plus light and dusk watercolour Fudan campus wallpapers and a dedicated settings page.'
  zh: '复旦主题的 DeepSeek 额度与校园天气状态卡（可拖动），以及日间 / 暮色水彩复旦校园壁纸与独立设置页。'
icon: https://raw.githubusercontent.com/zzzzym7018/dsh-fudan-status-wallpaper/main/assets/icon-180.png
```

Open a PR. After it merges, the market/index refreshes on its own schedule.

## Status

The repository has been created and pushed:
<https://github.com/zzzzym7018/dsh-fudan-status-wallpaper>
Release v2.1.0 and the installable tarball are also published. The only
remaining step is the `awesome-dsh-plugin` PR; it must wait until the
repository is at least 24 hours old (GitHub's submission CI checks this).
npm publishing is optional and still needs an `npm login` on this machine.
