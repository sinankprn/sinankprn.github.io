# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
# Install dependencies
bundle install

# Serve locally with live reload (development)
bundle exec jekyll serve

# Build for production
bundle exec jekyll build

# Test HTML output
bundle exec htmlproofer _site --disable-external
```

## Architecture

This is a Jekyll personal website using the [Chirpy theme](https://github.com/cotes2020/jekyll-theme-chirpy) (installed via gem). The site is deployed to GitHub Pages via the workflow in `.github/workflows/pages-deploy.yml`.

### Content Structure

- **`_posts/`**: Blog posts in Markdown with YAML front matter. Filename format: `YYYY-MM-DD-title.md`
- **`_tabs/`**: Navigation tabs (About, Projects, Publications, Talks, Resources, etc.) with `order` field controlling sidebar order
- **`_layouts/`**: Custom layouts extending the theme (currently only `projects.html`)
- **`_sass/addon/custom.scss`**: Custom CSS overrides for the theme
- **`assets/`**: Images, GIFs, PDFs, and presentations

### Projects System

Projects are regular posts tagged with `projects` in their `tags` field. The custom `_layouts/projects.html` layout filters and displays posts with this tag on the `/projects/` page. Project posts should follow this structure:
- Overview, Demo (with GIF), Learning Goals, Tech Stack, Takeaways

### Theme Customisation

The theme is installed as a gem (`jekyll-theme-chirpy`). To override theme files, copy them from the gem location (`bundle info --path jekyll-theme-chirpy`) into the corresponding local directory.

## Writing Guidelines

When authoring posts:
- Use British English spelling and conventions
- Avoid em dashes; use commas, full stops, or parentheses instead
- Timezone is `Australia/Sydney` (+1100 AEDT / +1000 AEST)
