---
layout: post
title: "A Roadmap for Gemini-Powered Meta-Science Extraction Tasks"
date: 2026-03-02 09:00:00 +1100
categories: [Large Language Models]
tags: [AI, Gemini, PDF, Meta-Science, Document Understanding, Research]
pin: false
description: "A roadmap of empirical questions for using Gemini's document understanding and derendering capabilities to automate meta-science extraction tasks."
---

Many researchers are attempting to automate journal article extraction using large language models, but the pipelines they build typically rely on traditional libraries to first read the PDF and convert it to text. Tools such as PyMuPDF and GROBID are widely used for this purpose, yet both can be unreliable on the complex layouts of journal articles, misreading tables, dropping figures, mangling equations, and losing the structural hierarchy that gives the extracted data its meaning. The quality of what a language model can extract is only as good as the text it is given.

Recently I had the opportunity to speak with Paul Litvak through John Warmenhoven and Franco Impellizzeri. Paul noted that a clear research roadmap for this area would be valuable. 

I would add that the field is poorly documented: many studies do not explicitly report their methods, despite the method being the most important contribution, more so than the results themselves. Some are using techniques that do not even operate on the full article, which undermines the value of the approach entirely. When methods are opaque, a poor result cannot be diagnosed: it is impossible to know whether the failure is an LLM issue or a data preprocessing issue. This post is an attempt to lay out the empirical questions that need to be answered, and to offer techniques that can account for the full journal article.

Gemini models offer a different approach. They have [native vision](https://ai.google.dev/gemini-api/docs/document-processing) to understand PDFs directly, reasoning over both the visual layout and the text as a whole, rather than parsing the text alone. They also support [derendering](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-pro-vision/): converting a rendered visual (a table, figure, or equation) back into a structured format such as Markdown, HTML, SVG, or LaTeX. Together, these capabilities make Gemini models a plausible tool for automating the extraction tasks. Whether they are reliable enough in practice is what needs to be tested.

## Roadmap

### 1. Is Gemini's native vision sufficient, and if not, does derendering help?

The baseline question is whether passing the PDF directly to Gemini via native vision and asking for structured extraction is already accurate enough. This needs to be tested with different media resolutions (low, medium, high). If it is, derendering adds complexity without benefit.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/oTQfn9kyorg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 1.2. Can using Agentic Vision with Documents improve accuracy?

Standard vision models process an image in a single static pass. If a fine-grained detail is missed, the model is forced to guess. [Agentic Vision](https://blog.google/innovation-and-ai/technology/developers-tools/agentic-vision-gemini-3-flash/) in Gemini 3 Flash changes this by treating image understanding as an active, iterative investigation rather than a one-shot inference. It introduces a Think, Act, Observe loop: the model analyses the image and formulates a plan, executes Python code to manipulate or inspect it (cropping, annotating, rotating, running calculations), then appends the result back into its context window before generating a response. Enabling code execution with Gemini 3 Flash has been reported to deliver a consistent 5–10% quality boost across vision benchmarks. Applied to document understanding, the question is whether this agentic process, zooming into dense tables, isolating figure regions, grounding reasoning in visual evidence, translates into meaningfully higher extraction accuracy for extraction tasks.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/BCdkpaymi2c" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 1.3. Can Gemini's spatial understanding appropriately identify the bounding boxes with native vision?

Gemini supports object detection: given an image, it can identify prominent elements and return their bounding box coordinates. Applied to a PDF page rendered as an image, this provides a way to see what the model is actually attending to. Rather than treating extraction as a black box, bounding boxes make the model's spatial reasoning visible and inspectable. If the model extracts a wrong value, the bounding boxes reveal whether it was looking at the right region of the page at all. This turns a previously opaque failure into a diagnosable one, and is the same interpretability argument made for derendering: separating the steps makes errors attributable.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/kbWTJ3VoDXg" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 2. Can Gemini derendering preserve hierarchical document structure?

Where native vision falls short, derendering to Markdown or HTML first is the candidate improvement. The argument is that native vision asks the model to do two things at once: interpret the visual layout and extract meaning from it. 

Derendering separates those concerns. The first pass converts the PDF into structured text; the second pass extracts from that text. The extraction step now operates entirely in the modality language models are strongest in (text), and the structured format (Markdown headers, HTML tags) explicitly encodes the hierarchy and boundaries that the model would otherwise have to infer visually. Model providers [recommend Markdown and XML](https://developers.openai.com/api/docs/guides/prompt-engineering#message-formatting-with-markdown-and-xml) for exactly this reason: they communicate structure more reliably than unformatted content. 

Another aspect this adds is interpretability: when an extraction is wrong, the intermediate Markdown or HTML can be inspected to determine whether the error occurred in the derendering step or the extraction step, which makes errors diagnosable and correctable in a way that a single-pass native vision failure is not.

All of this assumes the derendered output is accurate, which itself needs to be empirically verified.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/of6G2yZ3yFM" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 3. Can Gemini derendering reconstruct complex tables?

Tables in research papers routinely have multi-level column headers, merged cells, footnotes tied to specific cells, and layouts that span pages. These structures defeat traditional parsers and are exactly where the data of interest sits in literature.

The empirical question is whether derendering produces Markdown or HTML that correctly preserves hierarchical headers, cell boundaries, and footnote associations.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/_dBKgtMlew4" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 4. Can Gemini derender figures into SVG XML, Mermaid.js, Knowledge Graphs, DOT, MATLAB, Python Code or any other format and reason over it?

Studies frequently report results in figures rather than tables, ranging from quantitative plots to process diagrams and flow charts. SVG (Scalable Vector Graphics) is an XML-based format that describes images as a set of geometric instructions: lines, shapes, paths, and text with coordinates and attributes. Unlike a rasterised image (a JPEG or PNG), SVG is structured, readable code that a language model can parse directly. Other formats may be more natural depending on figure type: Mermaid.js for flow diagrams and process charts, DOT for graph-structured layouts, and knowledge graph triples for figures depicting causal or conceptual relationships. Each of these is a text-based, machine-readable representation that a language model may be able to reason about directly.

Two sub-questions need testing:

**Can Gemini accurately represent figures in these formats?** The first question is whether derendering produces faithful output at all, whether the SVG renders correctly, whether the Mermaid.js or DOT captures the right structure, whether the knowledge graph reflects the relationships in the figure. Validation requires comparing the derendered output against the source across a range of figure types.

**Can a model then reason about those representations to extract meaning?** Once the figure is in a structured, text-based format, the question is whether a model may be able to read it and answer useful questions from it. If so, these formats become viable intermediates for figure extraction in the same way that Markdown and HTML are for text and tables.

<iframe width="100%" height="468" src="https://www.youtube-nocookie.com/embed/1Ke-Sh690Dk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>

### 5. Can Gemini derender and reason over mathematical equations?

Traditional parsers handle equations poorly, garbling or dropping them entirely. Gemini 3 Pro can derender equations directly to LaTeX, and whether it can also reason over the resulting LaTeX to extract meaning both need to be empirically validated.

### 6. What is the end-to-end accuracy on a realistic extraction task?

Once the component questions above have been empirically validated, the pieces can be assembled into a full extraction pipeline and tested against a realistic meta-science task.
