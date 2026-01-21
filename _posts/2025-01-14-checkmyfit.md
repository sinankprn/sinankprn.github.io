---
layout: post
title: "CheckMyFit: AI Virtual Try-On Application"
date: 2025-01-14 11:00:00 +1100
categories: [Projects, Creative AI]
tags: [projects, ai, fashion, gemini, react]
description: "A virtual try-on application leveraging Google's Gemini API to generate outfit visualisations. Upload personal photos and clothing items to visualise different outfits across various poses."
---

## Overview

CheckMyFit is a virtual try-on application leveraging Google's Gemini API to generate outfit visualisations. Upload personal photos and clothing items to visualise different outfits across various poses.

**[View on GitHub](https://github.com/sinankprn/checkmyfit)**

## Key Features

- **Photo Upload:** Upload your personal photos and up to 5 clothing items
- **Multiple Poses:** Visualise outfits in four different poses:
  - Front-facing standing
  - Three-quarter turn
  - Casual stance
  - Walking motion
- **Image Download:** Save generated visualisations to your device
- **Responsive Interface:** Modern, clean design built with Tailwind CSS

## Technical Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Express.js
- **AI:** Google Gemini API (gemini-3-pro-image-preview model)

## Use Cases

Perfect for:
- Visualising how different clothing combinations look together
- Planning outfits before purchasing
- Experimenting with fashion styles
- Creating lookbooks and style guides

## Technical Approach

The application uses Google's Gemini vision model to understand both the user's photo and clothing items, then generates realistic visualisations of the person wearing those clothes in different poses. This demonstrates practical applications of multimodal AI models in the fashion and retail space.
