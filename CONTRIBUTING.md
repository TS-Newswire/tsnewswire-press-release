# Contributing

Thanks for your interest in improving the Press Release Toolkit. This project
is maintained by [TS Newswire](https://tsnewswire.com) and contributions are
welcome.

## Ways to contribute

- **Add a vertical template** — a new `templates/<vertical>.md` (fintech,
  health, gaming, esports). This is the easiest and most valuable first PR.
- **Improve the schema generator** — additional Schema.org properties,
  better validation, edge-case handling.
- **Fix bugs / docs** — typos, clarifications, examples.

## Development

No build step and no dependencies.

```bash
git clone https://github.com/vivekSm/press-release-toolkit.git
cd press-release-toolkit
npm test          # node --test
npm run example   # sanity-check the generator against the sample input
```

## Guidelines

1. Keep the core **dependency-free** — it must run on plain Node.js and in the browser.
2. Add or update a test in `test/` for any behavior change.
3. Validate generated JSON-LD against the
   [Schema Markup Validator](https://validator.schema.org/) before submitting.
4. Match the existing code style (ES modules, JSDoc on exported functions).
5. One focused change per pull request.

## Reporting issues

Open an issue with a minimal reproduction (the input JSON and the output you
expected vs. what you got).

## License

By contributing you agree your contributions are licensed under the
project's [MIT License](LICENSE).
