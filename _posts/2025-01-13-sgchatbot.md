---
layout: post
title: "SG Chatbot: RAG-Powered Anime Knowledge Base"
date: 2025-01-13 09:00:00 +1100
categories: [Projects, AI Chatbots]
tags: [projects, rag, llm, chatbot, react]
description: "A Steins;Gate themed RAG (Retrieval Augmented Generation) chatbot designed to answer questions about the anime using wiki retrieval and LLM-powered responses."
---

## Overview

A Steins;Gate themed RAG (Retrieval Augmented Generation) chatbot designed to answer questions about the anime using wiki retrieval and LLM-powered responses. This project combines semantic search with language models to create an informative, themed chatbot experience.

**[View on GitHub](https://github.com/sinankprn/sgchatbot)**

## Key Features

- **RAG Architecture:** Semantic search across Steins;Gate wiki content combined with LLM responses
- **Source Citations:** Every response includes links to referenced wiki pages
- **Themed Interface:** Dark-themed UI with Steins;Gate aesthetic elements
- **Vector Search:** ChromaDB for efficient semantic similarity search
- **Streaming Responses:** Real-time response generation for better user experience
- **Full-Stack:** Complete React frontend with Express.js backend

## Technical Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Express.js, Langchain, OpenAI API
- **Vector Database:** ChromaDB
- **Web Scraping:** Cheerio for wiki content extraction

## How It Works

1. **Data Collection:** Scrapes content from Steins;Gate Fandom wiki
2. **Processing:** Chunks content into semantic segments
3. **Embedding:** Generates embeddings using OpenAI's models
4. **Storage:** Stores vectors in ChromaDB for fast retrieval
5. **Query:** Retrieves relevant context based on user questions
6. **Generation:** Augments LLM responses with retrieved context and citations

## Technical Insights

This project demonstrates the power of RAG systems for domain-specific knowledge bases. By combining vector search with language models, it provides accurate, cited responses whilst maintaining the engaging aesthetic of the source material. The architecture is applicable to any domain where you want to ground AI responses in specific source material.
