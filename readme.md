# Logseq Plugin Bullet Threading

Add bullet threading to your active blocks in Logseq.

![](./logo.png)

## Settings

![](./settings.png)

## How it works

The plugin bundles the `v1.26.17` bullet-threading stylesheet from
[logseq-dev-theme](https://github.com/pengx17/logseq-dev-theme), so threading
works without a network request or mutable runtime cache. Base stylesheet
updates are intentionally release-pinned and must pass this repository's
verification before shipping.

Local compatibility overrides are always applied after the base stylesheet.
They support the extra wrapper elements used by Logseq DB, including nested
parent stems, active sibling segments, ordered lists, and doc mode.

## Development

```sh
pnpm install
pnpm verify
```

`pnpm verify` runs the headless geometry regression, builds the plugin, and
checks that the generated bundle contains both the offline baseline and the
Logseq DB compatibility styles. Set `CHROME_PATH` if Chrome or Chromium is not
installed in a standard macOS or Linux location.

# Issues

Base stylesheet issues can still be compared with
[logseq-dev-theme](https://github.com/pengx17/logseq-dev-theme). Logseq DB
compatibility issues belong in this plugin repository.
