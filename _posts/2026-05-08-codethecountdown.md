---
layout: post
title: "Vibe Code the Countdown"
date: 2026-05-08 10:00:00 +1000
last_modified_at: 2026-05-08 10:00:00 +1000
categories: [Projects, Creative Coding]
tags: [projects, creative coding, react, typescript, claude code, agentic coding]
description: "A 10-second countdown timer inspired by cellular automata, vibe-coded with Claude Code using skills, plan mode, and the AskUserQuestion tool."
image:
  path: /assets/img/og/codethecountdown.webp
  alt: "A cellular automata 10-second countdown timer"
---

## Overview

Code the Countdown is a browser-based 10-second countdown timer inspired by cellular automata. Each digit is rendered as a grid of cells that evolve and settle into the seconds remaining, with a generative pentatonic score running underneath.

**[Try it live](https://sinankprn.com/codethecountdown/)**

**[View on GitHub](https://github.com/sinankprn/codethecountdown)**

## Demo

![Code the Countdown Demo](/assets/gifs/codethecountdown.gif)

## Learning Goals

This was as much an experiment in agentic coding workflows as it was a creative-coding piece. Specifically, I wanted to explore:

* **Claude Code skills.** Skills are reusable instructions that Claude Code loads on demand for a given task. They let me bake in conventions for this project (typography, motion, audio cues) without restating them every prompt.
* **The frontend-design skill.** A built-in skill for building distinctive, polished interfaces. Pointing Claude at it pushed the visual design well past my default "AI generic" baseline. The bloom pass and parallax came out of suggestions I would not have prompted for myself.
* **Plan mode.** Forcing Claude into plan-only output before any edits meant I read and approved an architectural sketch before a single file changed. It caught two scope mistakes I would have shipped otherwise.
* **The AskUserQuestion tool.** Giving the agent a structured way to ask me questions, rather than guess, cut down the back-and-forth on ambiguous requirements. The audio FX chain in particular came out of a clarifying question I had not anticipated needing to answer.

## Tech Stack

* **Frontend Framework:** React 18 + TypeScript
* **Build Tool:** Vite
* **Animation:** Motion (formerly Framer Motion) for digit reveals and parallax
* **Audio:** Tone.js for the generative pentatonic score and FX chain
* **Rendering:** Canvas 2D with a downsampled bloom pass for cell glow
* **Typography:** Bagel Fat One (display) and JetBrains Mono (UI), via Google Fonts
* **Styling:** Hand-rolled CSS with custom properties, no framework

## Takeaways

* Vibe coding is faster, but it rewards investment in tooling. Skills, plan mode, and AskUserQuestion compounded over the project; without them I would have produced a more generic version of the same idea.
* The frontend-design skill is the single biggest lever I have found for escaping default AI aesthetics. If something looks generic, it usually means I forgot to invoke the skill.
* Plan mode is most valuable on the first pass of a feature, when scope is still soft. Once intent is locked in, edit mode is faster.
* Tone.js made adding generative audio almost trivial, and the pentatonic constraint kept random ticks from sounding random.
