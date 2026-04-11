# SEO Updates

Audit and fixes applied on 2026-04-11.

## What was already strong

The site already had most of the SEO fundamentals in place, inherited from the Chirpy theme and its plugins (`jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`, `jekyll-archives`):

- `sitemap.xml` generated and referenced from `robots.txt`
- Atom `feed.xml` generated
- Per-page Open Graph, Twitter card, canonical URL, schema.org `BlogPosting` JSON-LD
- Google Search Console and Bing site verification tokens set
- Favicons, web app manifest, PWA offline cache
- Clean post permalinks (`/posts/:title/`)
- Per-post and per-tab `description:` fields populated
- `llms.txt` index file present

## Gaps found

1. No per-post `image:` frontmatter. Every post was serving the site-wide avatar (`/assets/img/avatar.jpg`) as its OG and Twitter preview image. This is the single biggest social CTR miss.
2. `twitter.username:` was empty but the `twitter:` block was still present, so `jekyll-seo-tag` was emitting `<meta name="twitter:site" content="@">` with a bare `@`.
3. No top-level `author:` block. The schema.org `BlogPosting` JSON-LD was missing the `author` property entirely.
4. `llms-full.txt` was truncating each post to 2000 characters on a single line, stripping both HTML and newlines. The file was 61 lines. It was not "full" in any meaningful sense.
5. `assets/animations/scenes.html` (the iframe target for the context window post) had no robots directive, so search engines could index the raw scene pages as thin content.
6. `_config.yml` did not exclude `shorts/` (a Remotion sub-project with its own `node_modules`), which was why Jekyll was hanging on `Generating...` earlier in the session.

## Changes applied

### `_config.yml`

- Added top-level `author:` block so `jekyll-seo-tag` emits `<meta name="author">`, `article:author`, and populates `schema.org` `BlogPosting.author` as a `Person`:
  ```yaml
  author:
    name: Sinan Koparan
    email: sinan.koparan@uts.edu.au
    url: https://sinankprn.com
  ```
- Removed the empty `twitter:` block entirely. `jekyll-seo-tag` no longer emits the junk `twitter:site` `@` meta, and Chirpy does not reference `site.twitter` so nothing breaks.
- Extended `exclude:` to stop Jekyll walking directories that have nothing to do with the site build (also fixes the earlier `Generating...` hang):
  ```yaml
  exclude:
    - node_modules
    - scripts
    - shorts
    - .devcontainer
    - .github
    - .vscode
    - animation.html
  ```

### Per-post `image:` frontmatter

Added `image:` with `path:` and `alt:` to four posts so each one now gets a relevant OG and Twitter card preview instead of the generic avatar. The alt text doubles as `og:image:alt` and `twitter:image:alt`.

| Post | Image |
| --- | --- |
| `2025-01-12-prompt2canvas.md` | `/assets/gifs/prompt2canvas.gif` |
| `2025-01-18-paperextractor.md` | `/assets/gifs/paperextractor.gif` |
| `2025-02-08-claude-opus-4.6-for-sports-analytics.md` | `/assets/img/claudecodeterminal.PNG` |
| `2026-02-14-enhancing-sporting-organisation-efficiency-with-generative-ai.md` | `/assets/img/geminichatbot.PNG` |
| `2026-03-02-gemini-document-understanding-for-meta-science-extraction.md` | `/assets/img/geminiapi.PNG` |

`2026-04-10-the-secret-life-of-your-chatbot.md` was left without an explicit image because the post has no static visuals (everything is animated iframes). It still falls back to `site.social_preview_image` (the avatar). See "Recommended follow-ups" below for how to improve this.

### `llms-full.txt`

Changed the post and project loops so `post.content` is no longer passed through `strip_newlines | truncate: 2000`. Each post now renders its full body (HTML stripped, newlines preserved). The generated file grew from 61 lines to 1146 lines, which is the point of an `llms-full.txt`.

### `assets/animations/scenes.html`

Added `<meta name="robots" content="noindex,nofollow">` to the head. These scene pages are only meaningful when embedded as iframes inside the blog post. Without this directive, crawlers could index the standalone `scenes.html?n=1` through `?n=10` URLs as ten near-duplicate thin pages.

## Verified in the build output

After a clean rebuild (`rm -rf _site .jekyll-cache && bundle exec jekyll build`, ~7 seconds):

- `_site/posts/the-secret-life-of-your-chatbot/index.html` now contains:
  - `<meta name="author" content="Sinan Koparan">`
  - `schema.org BlogPosting` with `author: { @type: Person, name: Sinan Koparan, url: https://sinankprn.com }`
  - No `twitter:site @` meta
- `_site/posts/prompt2canvas/index.html` now contains:
  - `<meta property="og:image" content="https://sinankprn.com/assets/gifs/prompt2canvas.gif">`
  - `<meta property="og:image:alt" content="Prompt2Canvas turning a text prompt into live p5.js visuals in the browser">`
  - Matching `twitter:image` and `twitter:image:alt`
- `_site/llms-full.txt` is 1146 lines and includes full post bodies.
- `_site/sitemap.xml` is still 154 lines and includes all posts and tabs.
- `_site/feed.xml` is generated.
- `_site/robots.txt` points at `https://sinankprn.com/sitemap.xml`.

## Pre-existing issues NOT touched

These showed up as warnings during the build but are out of scope for an SEO pass:

1. **Tag page conflicts.** `jekyll-archives` and Chirpy's `_tabs/tags.md` layout both generate files under `/tags/<tag>/index.html` for `ai`, `pdf`, and `gemini` (and possibly more). The warning is:
   ```
   Conflict: tags/pdf/index.html ... tags/pdf/index.html
   ```
   Jekyll is picking one deterministically and the site renders, but this is worth deduplicating. Likely fix: remove `jekyll-archives` for tags (since Chirpy already handles them), or restrict the archive permalinks.
2. **`robots.txt` conflict.** The Chirpy theme ships its own `assets/robots.txt`; the project has a top-level `robots.txt`. The project version wins, but the warning is noisy. Could be silenced by moving ours under `assets/` or deleting one of them.

## Recommended follow-ups (not applied)

Stuff worth doing next, in rough order of impact:

1. **Create a static OG preview image for the context window post.** Right now it falls back to the avatar. A 1200x630 PNG that mimics one of the animation scenes (probably scene 2, "The Context Window") would meaningfully improve social CTR for the post. Save it to `/assets/img/` and add it to the post frontmatter as `image: { path: /assets/img/context-window-og.png, alt: "..." }`.
2. **Fix the tag page conflicts.** Either disable `jekyll-archives` tag generation in `_config.yml` or remove the tabs that overlap. The current duplicate pages are fine for users but muddy the sitemap.
3. **Add `last_modified_at:` to posts when you edit them.** `jekyll-seo-tag` will surface this in `schema.org BlogPosting.dateModified` and Google uses it as a freshness signal. Today every post's `dateModified` equals `datePublished`.
4. **Publish a real Twitter/X or Bluesky handle** in `social:` if you have one. That gives you `article:author` links on shared cards.
5. **Convert remaining PNG assets to WebP** (several `img/*.PNG` files are still PNG). Chirpy already does lazy loading, but WebP will cut page weight meaningfully on the sporting organisation post in particular.
6. **Preload the Google Font in `scenes.html`.** The `@import` inside `<style>` blocks rendering until the font fetch completes; switching to a `<link rel="preconnect">` + `<link rel="preload">` pair would speed up first paint inside each iframe.
7. **Add `keywords` via the existing Chirpy `tags:` frontmatter** — already present, nothing to do, noting it for completeness.
