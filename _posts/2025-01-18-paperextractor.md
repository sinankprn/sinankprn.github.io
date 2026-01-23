---
layout: post
title: "PaperExtractor: AI-Powered PDF Data Extraction"
date: 2025-01-18 14:00:00 +1100
categories: [Projects, AI Tools]
tags: [projects, ai, pdf, gemini, react, extraction]
description: "An AI-powered tool that extracts specific information from PDF documents. Upload a PDF, specify what information you need, and the application automatically finds it with source citations."
---

## Overview

PaperExtractor is an AI-powered tool that extracts specific information from PDF documents. Upload a PDF, specify what information you need, and the application automatically finds it with source citations.

**[View on GitHub](https://github.com/sinankprn/paperextractor)**

## Demo

![PaperExtractor Demo](/assets/gifs/paperextractor.gif)

I also shared this project and my thoughts on building it in a [LinkedIn post](https://www.linkedin.com/posts/sinankprn_systematic-literature-reviews-are-a-rigorous-activity-7416207278451773440-10_9?utm_source=social_share_send&utm_medium=member_desktop_web&rcm=ACoAAFKBnPQBt_vKtEOnQl4t0mFckzsUL2UdNIw)

## Learning Goals

* **Visual Derendering:** Leveraging Gemini 3 Pro's advanced visual derendering capabilities to reverse-engineer the visual layout of a PDF back into structured code.
* **Two-Stage Processing:** Converting PDFs to Markdown first (preserving structural hierarchy), then extracting requested fields with proof snippets.
* **Overcoming PDF Limitations:** Traditional PDF extraction is notoriously unreliable since PDFs are designed for humans, not computers, resulting in misordered text, broken tables, and poor formatting. The derendering approach addresses these challenges.
* **Visual Interface:** Building a three-panel display showing original PDF pages, OCR text, and extracted results.

## Tech Stack

* **Frontend:** React + Tailwind CSS
* **Backend:** Node.js + Express
* **AI API:** Google Gemini 3 Pro for intelligent extraction
* **PDF Processing:** pdf-to-img for document handling

## Takeaways

* Two-stage processing (PDF to Markdown, then extraction) improves accuracy and allows for better source citations.
* JSON schema mode in Gemini makes structured data extraction much more reliable.
* Providing field context instructions significantly improves extraction quality for domain-specific documents.
* Building a visual interface that shows the extraction proof alongside results helps users trust and verify the output.
* Markdown is widely recommended by model providers for use with Large Language Models, making it an ideal intermediate format.
