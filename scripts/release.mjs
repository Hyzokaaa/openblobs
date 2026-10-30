// Picks the next version from the commits since the last tag, the Conventional Commits way:
// feat → minor, fix or perf → patch, a breaking change → major (minor while below 1.0).
// Anything else (docs, chore, ci, test…) releases nothing.
//
//   node scripts/release.mjs --dry   prints what it would release
//   node scripts/release.mjs         bumps package.json and the lock file, dates "## Unreleased" in CHANGELOG.md,
//                                    and writes version=<x.y.z> to $GITHUB_OUTPUT when there is a release.
import { execFileSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const dry = process.argv.includes("--dry");

let since;
try { since = git("describe", "--tags", "--abbrev=0", "--match", "v*"); } catch { since = null; }
const range = since ? [`${since}..HEAD`] : ["HEAD"];
const commits = git("log", ...range, "--format=%B%x00").split("\0").map((c) => c.trim()).filter(Boolean);

const LEVELS = ["none", "patch", "minor", "major"];
let level = 0;
const notes = [];
for (const message of commits) {
  const [subject] = message.split("\n");
  const m = subject.match(/^(\w+)(?:\([^)]*\))?(!)?: (.+)$/);
  if (!m) continue;
  const [, type, bang, text] = m;
  const breaking = Boolean(bang) || /^BREAKING[ -]CHANGE:/m.test(message);
  const found = breaking ? 3 : type === "feat" ? 2 : type === "fix" || type === "perf" ? 1 : 0;
  if (found) notes.push(`- ${text}`);
  level = Math.max(level, found);
}

const current = JSON.parse(readFileSync("package.json", "utf8")).version;
// Below 1.0 a breaking change is a minor release, as npm and semver treat 0.x
const bump = LEVELS[level === 3 && current.startsWith("0.") ? 2 : level];

if (bump === "none") {
  console.log(`Nothing to release since ${since ?? "the first commit"}: no feat, fix, perf or breaking change.`);
  process.exit(0);
}
if (dry) {
  console.log(`Would release a ${bump} from ${current}, for ${commits.length} commits since ${since ?? "the first commit"}:\n${notes.join("\n")}`);
  process.exit(0);
}

execFileSync("npm", ["version", bump, "--no-git-tag-version"], { stdio: "inherit", shell: process.platform === "win32" });
const version = JSON.parse(readFileSync("package.json", "utf8")).version;
const date = new Date().toISOString().slice(0, 10);

// The hand-written notes under "## Unreleased" become this release; without them, list the commits
const changelog = readFileSync("CHANGELOG.md", "utf8");
const heading = `## ${version} (${date})`;
writeFileSync("CHANGELOG.md", /^## Unreleased$/m.test(changelog)
  ? changelog.replace(/^## Unreleased$/m, heading)
  : changelog.replace(/^(# Changelog\r?\n)/, `$1\n${heading}\n\n${notes.join("\n")}\n`));

if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
console.log(`Release ${version}`);
