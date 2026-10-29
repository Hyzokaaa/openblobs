# Changelog

## Unreleased

### Added

- Custom designs: `layeredDesign` builds one from SVG parts with colour placeholders, `defineDesign` draws one in code. Both get a seeded generator and the contrast-checked palette. Pass it as the `design` option or prop.
- `blobs`, the built-in design, written with the same API.
- `monsters`, a second design, from `openblobs/designs/monsters`. Every bundled design has its own module and is listed in `openblobs/designs`.
- `CONTRIBUTING.md`, issue and pull request templates, and tests that check every design in `src/designs` on their own: determinism, variety, well-formed SVG with nothing that leaks into the page, and a snapshot.
- The demo has a card per design and a playground: type SVG parts, see them on twelve seeds, and copy a design file that passes the tests. It opens on a design with `?design=<name>`.
- Designs can carry a one-line `description`.
- `default` export conditions, for tools that do not ask for `import`.

### Changed

- `Traits` no longer exposes the generator (`random`). It was internal state and calling it changed the next avatar.
- `MIN_CONTRAST`, `MIN_GEAR_CONTRAST` and `Palette` now cover every design, not only blobs.

### Fixed

- `size` is checked at runtime, so a value passed along from plain JavaScript can no longer inject attributes into the SVG.
- A blank seed (only spaces) now draws the same avatar as an empty one, the avatar of `"?"`. No other seed changes, so `GENERATION` stays at 1.

## 0.1.0

- First release: deterministic SVG blobs, `openblob`, `openblobUri` and the `<Openblob>` React component.
