# Changelog

## Unreleased

### Added

- Every design has named parts, and `design.with()` keeps them to the options you choose: `blobs.with({ top: "headset" })`, `monsters.with({ eyes: "one" })`, `robots.with({ antenna: "none" })`. Each person keeps everything else, and seeds that already have an allowed option draw exactly as before. The choice is typed, `design.parts` lists the parts with their options and where they sit, and `traitsOf(seed, choice)` takes the blobs' choice.
- `layeredDesign` layers can have a name, option names and a position: `{ name: "eyes", options: ["two", "one"], at: [40, 47], parts: [...] }`. Naming changes nothing a seed draws.
- The demo opens on a stage: the character, large and alive, with your name as its title and its parts around it. Pointing at a part draws a line to it and lights it up; each option is drawn on your seed, framed on the part, and the seed's own pick is marked. Picking one pins it for everyone, with a bounce, and the code in the corner shows the `with()`. The address keeps the design, the parts, the mood and the seed, as in `?design=robots&antenna=none&mood=happy`. The avatar wall, the team list, the comments and the playground below follow what you pin.
- The playground names layers (`# eyes`) and options (`dots: <svg>`), measures where each part sits, and its design file passes the tests as is.
- Releases are automatic: every push to `main` with a `feat:`, `fix:` or breaking commit since the last tag publishes the next version to npm.

### Changed

- The bundled designs name their layers. Every avatar draws exactly as before: same snapshots, same `GENERATION`.
- Designs in `src/designs` name their parts: the tests check that each option draws something different and leaves seeds that already have it unchanged.

## 0.2.0 (2026-10-29)

### Added

- Custom designs: `layeredDesign` builds one from SVG parts with colour placeholders, `defineDesign` draws one in code. Both get a seeded generator and the contrast-checked palette. Pass it as the `design` option or prop.
- `blobs`, the built-in design, written with the same API.
- Three more designs: `monsters`, `robots` and `critters`, from `openblobs/designs/<name>`. Every bundled design has its own module, and `designs` from `openblobs/designs` lists them in order.
- Moods for every design: a layer of `layeredDesign` can give its parts per mood, and each person keeps their features when the mood changes. `design.moods` lists what a design draws; the `mood` option works for all of them.
- `CONTRIBUTING.md`, issue and pull request templates, and tests that check every design in `src/designs` on their own: determinism, variety, well-formed SVG with nothing that leaks into the page, and a snapshot.
- The demo opens with the install command for npm, pnpm, yarn or bun and the code for your config, in React, JavaScript or any framework, live as you change it. Each design in the picker, a row that scrolls with any number of them, previews a team drawn in it, and there is a playground: type SVG parts, see them on twelve seeds, and copy a design file that passes the tests. It opens on a design with `?design=<name>`.
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
