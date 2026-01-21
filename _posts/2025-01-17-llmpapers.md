---
layout: post
title: "LLM Papers: Automated Research Paper Collection"
date: 2025-01-17 10:00:00 +1100
categories: [Projects, Research Tools]
tags: [projects, llm, research, arxiv, automation]
pin: true
description: "An automated system for collecting, categorising, and displaying research papers about Large Language Model applications from arXiv. Hosted on GitHub Pages with daily automated updates."
---

## Overview

LLM Papers is an automated system for collecting, categorising, and displaying research papers about Large Language Model applications from arXiv. Hosted on GitHub Pages with daily automated updates.

**[View Live Site](https://github.com/sinankprn/llmpapers)** | **[View on GitHub](https://github.com/sinankprn/llmpapers)**

## Key Features

- **Automated Collection:** Uses 13 targeted arXiv search queries to gather relevant papers
- **Smart Categorisation:** Auto-categorises papers into topics like agents, tool-use, reasoning, and RAG
- **Search & Filter:** Fuzzy search and filtering capabilities using Fuse.js
- **Daily Updates:** Automated updates via GitHub Actions ensure the latest papers are always available
- **Static Site:** Lightweight static site hosted on GitHub Pages for fast performance
- **Manual Curation:** Blocklist system for filtering unwanted papers

## Technical Implementation

The system organises papers by year in separate JSON files and maintains a lightweight index for fast frontend loading. It implements rate-limiting for arXiv API requests and includes deduplication logic. The categorisation uses keyword-based matching across predefined topic categories.

## Technical Stack

- **Frontend:** JavaScript, HTML, CSS, Fuse.js
- **Automation:** GitHub Actions
- **Hosting:** GitHub Pages
- **Data Source:** arXiv API

## Why I Built This

As someone deeply interested in LLMs and their applications, I needed a way to stay current with the rapidly evolving research landscape. This tool automates the tedious process of manually searching arXiv and organises papers in a way that makes them easy to discover and explore.
