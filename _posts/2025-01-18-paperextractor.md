---
layout: post
title: "PaperExtractor: AI-Powered PDF Data Extraction"
date: 2025-01-18 14:00:00 +1100
categories: [Projects, AI Tools]
tags: [projects, ai, pdf, gemini, react]
pin: true
description: "An AI-powered tool that extracts specific information from PDF documents. Upload a PDF, specify what information you need, and the application automatically finds it with source citations."
---

## Overview

PaperExtractor is an AI-powered tool that extracts specific information from PDF documents. Upload a PDF, specify what information you need, and the application automatically finds it with source citations.

**[View on GitHub](https://github.com/sinankprn/paperextractor)**

## Key Features

- **AI-Powered Extraction:** Uses Google Gemini 2.0 API with JSON schema mode for intelligent data parsing
- **Two-Stage Processing:** Converts PDFs to Markdown first, then extracts requested fields with proof snippets
- **Multiple Field Types:** Supports text, number, date, boolean, and list field types
- **Visual Interface:** Three-panel display showing original PDF pages, OCR text, and extracted results
- **Export Options:** JSON and CSV export formats for extracted data
- **Advanced Features:** Field context instructions, research paper mode, and support for multiple values per field

## Technical Stack

- **Frontend:** React, Tailwind CSS
- **Backend:** Node.js, Express
- **AI:** Google Gemini 2.0 API
- **PDF Processing:** pdf-to-img

## Use Cases

Perfect for researchers, analysts, and anyone who needs to systematically extract information from large volumes of PDF documents. The research paper mode is particularly useful for extracting data from academic publications.
