// Draws media/preview.svg, the image at the top of the README: a row of blobs and a row of the example monsters.
import { writeFileSync } from "node:fs";
import { layeredDesign, openblob } from "../dist/index.js";
import { monsters } from "../demo/monsters.js";

const SEEDS = ["Sam Porter", "Carla Méndez", "Leo Martín", "Ana López", "01JD8X2K4P", "Priya Natarajan", "Øyvind Hansen", "hello@example.com"];
const CELL = 88, GAP = 12, ROWS = [{}, { design: layeredDesign(monsters) }];
const width = SEEDS.length * CELL + (SEEDS.length - 1) * GAP, height = ROWS.length * CELL + (ROWS.length - 1) * GAP;

const cells = ROWS.flatMap((options, row) => SEEDS.map((seed, col) =>
  openblob(seed, { ...options, size: CELL }).replace("<svg ", `<svg x="${col * (CELL + GAP)}" y="${row * (CELL + GAP)}" `)));

writeFileSync(
  new URL("../media/preview.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${cells.join("")}</svg>\n`,
);
