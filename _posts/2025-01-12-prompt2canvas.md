---
layout: post
title: "Prompt2Canvas: Creative AI Content Generation"
date: 2025-01-12 15:00:00 +1100
categories: [Projects, AI Tools]
tags: [projects, ai, creative, javascript]
description: "A full-stack application for creative AI-powered content generation. Transform text prompts into visual content using modern web technologies and AI capabilities."
---

## Overview

Prompt2Canvas can take any text prompt and turn it into live, interactive visuals in the browser. This is powered by Gemini 3, which generates p5.js code based on your prompt, and the application executes that code directly on a canvas.

**[View on GitHub](https://github.com/sinankprn/prompt2canvas)**


## Demo

![Prompt2Canvas Demo](/assets/gifs/prompt2canvas.gif)

I also shared this project and my thoughts on building it in a [LinkedIn post](https://www.linkedin.com/posts/sinankprn_i-have-been-experimenting-with-how-large-activity-7418743994987454464-fhMa?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFKBnPQBt_vKtEOnQl4t0mFckzsUL2UdNIw)

## Learning Goals

* **AI Integration:** Understanding how to dynamically generate and safely execute JavaScript (p5.js) from AI models like Gemini 3.
* **Prompt-to-Code Workflow:** Experimenting with prompt engineering to guide AI code generation.
* **Interactive Frontend:** Rendering AI-generated sketches in real-time using p5.js.

## Tech Stack

* **Frontend:** React + p5.js for interactive rendering
* **Backend:** Node.js + Express, communicates with Gemini 3 API
* **AI API:** Gemini 3 for generating p5.js sketches from text prompts

## Takeaways

* Dynamically generating and running code safely in the browser is tricky but rewarding.
* Using AI (Gemini 3) to turn prompts into p5.js sketches taught me the importance of prompt design and error handling.
* Combining AI and interactive front-end development creates highly engaging user experiences.