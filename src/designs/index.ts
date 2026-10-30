// Every design that ships with openblobs, one file each.
// Each one can also be imported on its own: `import { monsters } from "openblobs/designs/monsters"`.
import type { Design } from "../design.js";
import { cacti } from "./cacti.js";
import { critters } from "./critters.js";
import { monsters } from "./monsters.js";
import { robots } from "./robots.js";

// Named exports in alphabetical order
export { cacti, critters, monsters, robots };

/** The bundled designs in the order the demo and the docs show them, after `blobs`. Add new ones at the end. */
export const designs: readonly Design[] = [monsters, robots, critters, cacti];
