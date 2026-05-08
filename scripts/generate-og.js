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

async function deriveAccent(browser, sourceUrl) {
  const page = await browser.newPage();
  try {
    await page.setContent(
      `<!doctype html><html><body style="margin:0"><img id="x" src="${sourceUrl}"/></body></html>`,
      { waitUntil: "load" }
    );
    const hex = await page.evaluate(async () => {
      const img = document.getElementById("x");
      await img.decode();
      const W = 160, H = 90;
      const c = document.createElement("canvas");
      c.width = W; c.height = H;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, W, H);
      const { data } = ctx.getImageData(0, 0, W, H);

      function rgb2hsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
          else if (max === g) h = (b - r) / d + 2;
          else h = (r - g) / d + 4;
          h /= 6;
        }
        return [h * 360, s, l];
      }

      const bins = new Map();
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const [h, s, l] = rgb2hsl(r, g, b);
        if (s < 0.45) continue;
        if (l < 0.35 || l > 0.75) continue;
        const hb = Math.round(h / 20) * 20;
        const key = hb;
        const e = bins.get(key) || { count: 0, r: 0, g: 0, b: 0, sSum: 0 };
        e.count++; e.r += r; e.g += g; e.b += b; e.sSum += s;
        bins.set(key, e);
      }

      function toHex(r, g, b) {
        return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
      }

      if (bins.size === 0) return toHex(200, 200, 200);

      let best = null;
      for (const v of bins.values()) {
        const score = v.count * (v.sSum / v.count);
        if (!best || score > best.score) best = { ...v, score };
      }
      let r = best.r / best.count;
      let g = best.g / best.count;
      let b = best.b / best.count;

      // Boost saturation/luminance so the swatch stays punchy on screen
      const [h, s, l] = rgb2hsl(r, g, b);
      const targetS = Math.max(s, 0.85);
      const targetL = Math.min(Math.max(l, 0.55), 0.65);
      function hsl2rgb(h, s, l) {
        h /= 360;
        if (s === 0) return [l * 255, l * 255, l * 255];
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        return [
          hue2rgb(p, q, h + 1 / 3) * 255,
          hue2rgb(p, q, h) * 255,
          hue2rgb(p, q, h - 1 / 3) * 255,
        ];
      }
      [r, g, b] = hsl2rgb(h, targetS, targetL);
      return toHex(r, g, b);
    });
    return hex;
  } finally {
    await page.close();
  }
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
    let renderPost = post;
    if (post.accent === "auto" || !post.accent) {
      const sourcePath = path.join(sourceDir, post.source);
      if (fs.existsSync(sourcePath)) {
        const ext = path.extname(post.source).slice(1).toLowerCase();
        const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
        const b64 = fs.readFileSync(sourcePath).toString("base64");
        const sourceUrl = `data:${mime};base64,${b64}`;
        const derived = await deriveAccent(browser, sourceUrl);
        console.log(`[accent] ${post.slug}: derived ${derived}`);
        renderPost = { ...post, accent: derived };
      }
    }
    const html = render(renderPost, index, fontCss);
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
