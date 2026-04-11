const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const repoRoot = path.join(__dirname, "..");
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "og.config.json"), "utf-8")
);
const template = fs.readFileSync(
  path.join(__dirname, "og-template.html"),
  "utf-8"
);

const sourceDir = path.join(repoRoot, config.sourceDir);
const outputDir = path.join(repoRoot, config.outputDir);
const cacheDir = path.join(__dirname, ".fontcache");
fs.mkdirSync(outputDir, { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,900;1,400&family=JetBrains+Mono:wght@700&display=swap";
const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  return res.text();
}

async function fetchBuffer(url) {
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_UA } });
  if (!res.ok) throw new Error(`fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function buildFontCss() {
  const cachePath = path.join(cacheDir, "fonts.css");
  if (fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, "utf-8");
  }
  console.log("[fonts] fetching Google Fonts CSS (one-time)");
  let css = await fetchText(GOOGLE_FONTS_URL);
  const urlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g;
  const urls = [...new Set([...css.matchAll(urlRegex)].map((m) => m[1]))];
  for (const url of urls) {
    const buf = await fetchBuffer(url);
    const b64 = buf.toString("base64");
    const dataUri = `data:font/woff2;base64,${b64}`;
    css = css.split(url).join(dataUri);
    console.log(`[fonts] inlined ${url.split("/").pop()} (${(buf.length / 1024).toFixed(0)} KB)`);
  }
  fs.writeFileSync(cachePath, css);
  return css;
}

function pickSizeClass(headline) {
  const len = headline.length;
  if (len <= 18) return "";
  if (len <= 26) return "small";
  return "xsmall";
}

function dateLabel(post) {
  const m = post.postFile.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  return `${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

function accentName(hex) {
  const named = {
    "#ff2d95": "Magenta",
    "#ffb020": "Saffron",
    "#00d4ff": "Cyan",
    "#ffa500": "Amber",
    "#4fc3f7": "Azure",
    "#c77dff": "Violet",
  };
  return (named[hex.toLowerCase()] || "Signal").toUpperCase();
}

function render(post, index, fontCss) {
  const sourcePath = path.join(sourceDir, post.source);
  if (!fs.existsSync(sourcePath)) {
    console.warn(`[skip] ${post.slug}: missing source ${post.source}`);
    return null;
  }
  const ext = path.extname(post.source).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  const b64 = fs.readFileSync(sourcePath).toString("base64");
  const sourceUrl = `data:${mime};base64,${b64}`;
  const kicker = (post.kicker || "Field Notes").toUpperCase();
  const issue = String(index + 1).padStart(3, "0");

  return template
    .replace(/\{\{FONT_CSS\}\}/g, fontCss)
    .replace(/\{\{ACCENT\}\}/g, post.accent)
    .replace(/\{\{ACCENT_NAME\}\}/g, accentName(post.accent))
    .replace(/\{\{SOURCE\}\}/g, sourceUrl)
    .replace(/\{\{KICKER\}\}/g, kicker)
    .replace(/\{\{HEADLINE\}\}/g, post.headline)
    .replace(/\{\{SIZE_CLASS\}\}/g, pickSizeClass(post.headline))
    .replace(/\{\{SUBTITLE\}\}/g, post.subtitle || "")
    .replace(/\{\{AUTHOR\}\}/g, config.author.toUpperCase())
    .replace(/\{\{SITE\}\}/g, config.site.toUpperCase())
    .replace(/\{\{ISSUE\}\}/g, issue)
    .replace(/\{\{DATE_LABEL\}\}/g, dateLabel(post));
}

function updateFrontmatter(post, imagePath) {
  const postPath = path.join(repoRoot, "_posts", post.postFile);
  if (!fs.existsSync(postPath)) {
    console.warn(`[warn] post file not found: ${post.postFile}`);
    return;
  }
  const raw = fs.readFileSync(postPath, "utf-8");
  const crlf = raw.includes("\r\n");
  const src = raw.replace(/\r\n/g, "\n");
  const fmMatch = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    console.warn(`[warn] no frontmatter in ${post.postFile}`);
    return;
  }
  let fm = fmMatch[1];
  const alt = post.subtitle || post.headline;
  const imageBlock = `image:\n  path: /${imagePath.replace(/\\/g, "/")}\n  alt: "${alt.replace(/"/g, '\\"')}"`;

  if (/^image:/m.test(fm)) {
    fm = fm.replace(/^image:(?:\n[ \t]+.*)*/m, imageBlock);
  } else {
    fm = fm.trimEnd() + "\n" + imageBlock;
  }
  let updated = `---\n${fm}\n---\n` + src.slice(fmMatch[0].length);
  if (crlf) updated = updated.replace(/\n/g, "\r\n");
  fs.writeFileSync(postPath, updated);
  console.log(`[frontmatter] ${post.postFile}`);
}

(async () => {
  const onlySlug = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const writeFrontmatter = process.argv.includes("--write-frontmatter");

  const indexed = config.posts.map((p, i) => ({ post: p, index: i }));
  const selected = onlySlug
    ? indexed.filter(({ post }) => post.slug === onlySlug)
    : indexed;

  if (!selected.length) {
    console.error(`No posts matched '${onlySlug}'.`);
    process.exit(1);
  }

  const fontCss = await buildFontCss();

  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: {
      width: config.width,
      height: config.height,
      deviceScaleFactor: 3,
    },
  });

  for (const { post, index } of selected) {
    const html = render(post, index, fontCss);
    if (!html) continue;
    const page = await browser.newPage();
    await page.setViewport({
      width: config.width,
      height: config.height,
      deviceScaleFactor: 3,
    });
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const outPath = path.join(outputDir, `${post.slug}.webp`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: config.width, height: config.height },
      omitBackground: false,
      type: "webp",
      quality: 88,
    });
    await page.close();
    const rel = path.relative(repoRoot, outPath);
    console.log(`[rendered] ${rel}`);
    if (writeFrontmatter) updateFrontmatter(post, rel);
  }

  await browser.close();
})();
