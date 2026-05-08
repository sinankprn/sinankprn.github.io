/**
 * Generate base "frontmatter" images for OG cards using Nano Banana Pro 2
 * (model id: gemini-3-pro-image-preview).
 *
 * The system prompt lives in system.md and defines the universal style
 * (cinematic, dark, 16:9, upper-left third empty for overlay text).
 * Per-post subject comes from og.config.json's `imagePrompt` field, falling
 * back to "<headline>. <subtitle>" when not set.
 *
 * Usage:
 *   node scripts/generate-frontmatter.js               # all posts (skip existing)
 *   node scripts/generate-frontmatter.js <slug>        # one post
 *   node scripts/generate-frontmatter.js <slug> --force  # overwrite existing
 *
 * Env: GEMINI_API_KEY must be set.
 */

const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const repoRoot = path.join(__dirname, '..');
const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'og.config.json'), 'utf-8'),
);
const systemPrompt = fs
  .readFileSync(path.join(repoRoot, 'system.md'), 'utf-8')
  .trim();

const sourceDir = path.join(repoRoot, config.sourceDir);
fs.mkdirSync(sourceDir, { recursive: true });

const MODEL = 'gemini-3.1-flash-image-preview';
const ASPECT = '16:9';
const SIZE = '2K';

const MIME_EXT = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

function buildPrompt(post) {
  const subject =
    post.imagePrompt ||
    [post.headline, post.subtitle].filter(Boolean).join('. ');
  return `${systemPrompt}\n\nSubject: ${subject}`;
}

async function generateOne(post, ai, { force }) {
  const sourcePath = path.join(sourceDir, post.source);
  if (fs.existsSync(sourcePath) && !force) {
    console.log(
      `[skip] ${post.slug}: ${post.source} exists (use --force to overwrite)`,
    );
    return;
  }

  const prompt = buildPrompt(post);
  const subjectPreview = prompt.split('Subject: ').pop();
  console.log(`[gen]  ${post.slug} -> ${post.source}`);
  console.log(
    `        subject: ${subjectPreview.slice(0, 110)}${
      subjectPreview.length > 110 ? '...' : ''
    }`,
  );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: ASPECT,
        imageSize: SIZE,
      },
    },
  });

  const parts = response?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData?.data);
  if (!imagePart) {
    const textPart = parts.find((p) => p.text)?.text;
    throw new Error(
      `no image in response${textPart ? ` (text: ${textPart.slice(0, 200)})` : ''}`,
    );
  }

  const buf = Buffer.from(imagePart.inlineData.data, 'base64');
  const responseMime = imagePart.inlineData.mimeType || 'image/png';
  const expectedExt = MIME_EXT[responseMime] || '.png';
  const configuredExt = path.extname(post.source).toLowerCase();
  if (configuredExt && configuredExt !== expectedExt) {
    console.warn(
      `[warn] ${post.slug}: config source uses '${configuredExt}' but model returned '${responseMime}'. ` +
        `Writing bytes as-is; consider updating og.config.json source to '${path.basename(
          post.source,
          configuredExt,
        )}${expectedExt}'.`,
    );
  }

  fs.writeFileSync(sourcePath, buf);
  console.log(
    `[saved] ${path.relative(repoRoot, sourcePath)} (${(buf.length / 1024).toFixed(0)} KB)`,
  );
}

(async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.error('[error] GEMINI_API_KEY env var is not set.');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const onlySlug = args.find((a) => !a.startsWith('--'));

  const selected = onlySlug
    ? config.posts.filter((p) => p.slug === onlySlug)
    : config.posts;

  if (!selected.length) {
    console.error(`No posts matched '${onlySlug}'.`);
    process.exit(1);
  }

  const ai = new GoogleGenAI({});

  let failures = 0;
  for (const post of selected) {
    try {
      await generateOne(post, ai, { force });
    } catch (e) {
      failures += 1;
      console.error(`[error] ${post.slug}: ${e.message}`);
    }
  }

  if (failures) {
    process.exit(1);
  }
})();
