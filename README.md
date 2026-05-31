# Press Release Toolkit

Open-source **JSON-LD schema generator** and **press-release templates** for
publishing SEO-friendly press releases.

Maintained by **[TS Newswire](https://tsnewswire.com)** — press release
distribution and digital PR.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)
![Dependencies](https://img.shields.io/badge/dependencies-0-blue)

## Why this exists

Most press releases ship as plain HTML with no structured data. Without it,
search engines can't reliably identify the headline, publisher, author, or
publish date — so the release misses **Google rich results** and **Google
News** eligibility, and loses ranking signals.

This toolkit fixes that. Give it the facts of your release and it produces
valid [Schema.org](https://schema.org/NewsArticle) `NewsArticle` +
`Organization` JSON-LD you can drop straight into the page `<head>`.

- **Zero dependencies** — pure JavaScript, runs in Node.js (>= 16) or the browser.
- **Validated output** — flags missing required fields and rich-result pitfalls.
- **Vertical templates** — battle-tested release structures for crypto/web3, iGaming, and SaaS.

## Quick start

```bash
# Clone and run against the bundled example
git clone https://github.com/vivekSm/press-release-toolkit.git
cd press-release-toolkit
npm run example
```

Or use it as a library:

```js
import { generateSchema, generateScriptTag } from './src/schema-generator.js';

const jsonLd = generateSchema({
  headline: 'Acme Chain Launches Audited Layer-2 Network',
  body: 'SINGAPORE — Acme Chain today announced…',
  url: 'https://tsnewswire.com/news/acme-chain-layer-2',
  datePublished: '2026-05-31T09:00:00+08:00',
  image: 'https://tsnewswire.com/media/acme-chain-hero.jpg',
  publisherName: 'TS Newswire',
  publisherUrl: 'https://tsnewswire.com',
  publisherLogo: 'https://tsnewswire.com/logo.png',
  keywords: ['crypto', 'layer-2', 'web3'],
  articleSection: 'Crypto',
});

// Embed directly in your page <head>:
console.log(generateScriptTag({ /* …same input… */ }));
```

## CLI

```bash
# Print JSON-LD
node src/cli.js examples/sample-release.json

# Print a ready-to-paste <script> tag
node src/cli.js examples/sample-release.json --tag

# Validate only (exit code 1 if required fields are missing)
node src/cli.js examples/sample-release.json --validate

# Pipe from stdin
cat release.json | node src/cli.js
```

## Input fields

| Field | Required | Notes |
|---|---|---|
| `headline` | ✅ | Keep ≤ 110 chars for rich results. |
| `body` | ✅ | Plain text or HTML; word count is derived automatically. |
| `url` | ✅ | Canonical absolute URL of the published release. |
| `datePublished` | ✅ | ISO 8601 (`2026-05-31` or full timestamp). |
| `publisherName` | ✅ | Issuing organization. |
| `publisherUrl` | ✅ | Organization website. |
| `publisherLogo` | recommended | ≥ 112×112 px, absolute URL. |
| `image` | recommended | String URL, `{url,width,height}`, or an array. |
| `description` | optional | Short summary / dek. |
| `authorName` / `authorUrl` | optional | Defaults to the publisher. |
| `keywords` | optional | Array of topic tags. |
| `articleSection` | optional | e.g. `"Crypto"`, `"iGaming"`. |
| `dateModified` | optional | Defaults to `datePublished`. |
| `inLanguage` | optional | BCP-47 tag; defaults to `en`. |

## Templates

Ready-to-fill release structures live in [`templates/`](templates):

- [`crypto-web3.md`](templates/crypto-web3.md)
- [`igaming.md`](templates/igaming.md)
- [`saas.md`](templates/saas.md)

## Validate your output

Paste the generated JSON-LD into Google's
[Rich Results Test](https://search.google.com/test/rich-results) or the
[Schema Markup Validator](https://validator.schema.org/) to confirm eligibility.

## Tests

```bash
npm test   # runs node --test, zero dependencies
```

## Contributing

PRs welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Adding a template for a
new vertical (health, fintech, gaming) is a great first contribution.

## License

[MIT](LICENSE) — free to use, fork, and adapt.

---

Built and maintained by [TS Newswire](https://tsnewswire.com).
