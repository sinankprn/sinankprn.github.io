/**
 * Full OG pipeline: generate the base image with Nano Banana Pro 2,
 * then composite the overlay (text, kicker, accent) into the final webp.
 *
 * Usage:
 *   node scripts/og-pipeline.js                      # all posts
 *   node scripts/og-pipeline.js <slug>               # one post
 *   node scripts/og-pipeline.js <slug> --force       # regen the base image too
 *   node scripts/og-pipeline.js <slug> --write-frontmatter  # also patch the post
 *
 * Forwards positional args + flags to both stages. --force only affects
 * the frontmatter generator (the OG compositor always re-renders).
 */

const path = require("path");
const { spawn } = require("child_process");

function run(scriptName, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, scriptName), ...args],
      { stdio: "inherit" }
    );
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

(async () => {
  const args = process.argv.slice(2);

  // generate-og.js doesn't know --force; strip it.
  const ogArgs = args.filter((a) => a !== "--force");
  // generate-frontmatter.js doesn't know --write-frontmatter; strip it.
  const fmArgs = args.filter((a) => a !== "--write-frontmatter");

  console.log("=== Stage 1/2: Nano Banana Pro 2 -> base image ===");
  await run("generate-frontmatter.js", fmArgs);

  console.log("\n=== Stage 2/2: Puppeteer overlay -> final OG webp ===");
  await run("generate-og.js", ogArgs);
})().catch((e) => {
  console.error(`[pipeline] ${e.message}`);
  process.exit(1);
});
