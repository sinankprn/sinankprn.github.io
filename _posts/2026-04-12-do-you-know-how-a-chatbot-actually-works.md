---
layout: post
title: "Do You Know How a Chatbot Actually Works?"
date: 2026-04-12 09:00:00 +1000
last_modified_at: 2026-04-12 09:00:00 +1000
categories: [Large Language Models]
tags: [AI, Generative AI, AI Literacy, Context Window, Tokens, LLMs]
pin: false
description: "A visual tour of what happens inside a chatbot: tokens, the context window, hidden instructions, compaction, memory, and reasoning tokens."
image:
  path: /assets/img/og/the-secret-life-of-your-chatbot.webp
  alt: "What's really in your chatbot's context window"
---

More and more people are using chatbots to inform, or even make, critical decisions. Yet few have a clear picture of what data the model is actually operating on.

As an example, according to depositions and other materials released as part of a civil lawsuit related to US federal funding cuts, the Department of Government Efficiency (DOGE) [relied on ChatGPT](https://abcnews.com/Politics/2-doge-staffers-regrets-people-losing-income-reduce/story?id=131050170) to identify more than $100 million in grants related to diversity, equity, and inclusion (DEI) that were later cancelled. Because of how chatbots handle documents (as we will explore below), it is not clear whether the model was actually operating on the entire data to inform the decision.

Researchers are also beginning to examine these tools more closely. [Nguyen and Welch (2025)](https://journals.sagepub.com/doi/10.1177/10944281251377154) explored whether ChatGPT can conduct qualitative data analysis and found it to be unreliable for this task. However, their study does not report whether memory was turned off or which subscription tier was used, both of which directly influence what data the model operates on and, consequently, the outputs it produces.

Both examples have real world consequences. The DOGE decisions contributed to people losing their income. The Nguyen and Welch study, which was [amplified on LinkedIn](https://www.linkedin.com/posts/lorenzoskade_qualitativereserach-qualitativedataanalysis-activity-7379075567800774656-Mopp), has influenced many researchers to dismiss generative AI outright, even though the technology is continually being used to advance science in other areas. Once people form a negative perception of these tools, it becomes difficult to get them to engage with them again, which risks cutting entire fields off from methods that could genuinely help their work.

These examples highlight a gap. A lot of people think generative AI literacy simply means knowing how to use the user interface of a chatbot: typing prompts, clicking buttons, and getting answers. But to me, it goes much deeper than that. Generative AI literacy means understanding what data the model is actually operating on at any given moment.

This post focuses on the context window. I believe understanding it is a core part of AI literacy.

## Tokens

Large language models operate only on tokens. When you type something into a chatbot and press send, that text is invisibly converted into tokens. You can assume that one word is roughly one token. You can play around with the [OpenAI tokeniser](https://platform.openai.com/tokenizer) to see this in action.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=1" loading="lazy" title="Scene 1: Tokens" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

A context window is simply the finite number of tokens a model can see and process at one time. Many chatbot products hide the existence of this limitation from users.

But how do we know the context window exists? Well, aside from reading technical documentation, you can test it yourself. Try pasting massive amounts of text into a chatbot and you will encounter an error telling you that the input is too long. Some chatbots may not even allow you to press send.

![ChatGPT showing a "Message is too long" error](/assets/img/longmessage.png){: .shadow }
_ChatGPT refusing to send a message that exceeds the context window._

The easiest way to think about the context window is to imagine a fixed-size box. Every message you send, every response from the assistant, it all must fit inside this box. The size of the box depends on the model being used. But in practice, that is not always the full story. With some providers, the size of the box is also influenced by the subscription tier you are paying for. For example, OpenAI lists different context window sizes for each tier on its [pricing page](https://chatgpt.com/pricing/).

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=2" loading="lazy" title="Scene 2: The Context Window" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

## What happens as you chat

In a multi-turn conversation, every new message (both yours and the assistant's) takes up space in the box. As the conversation grows, these messages steadily consume the available context window.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=3" loading="lazy" title="Scene 3: Multi-turn conversation" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

So what happens when the box becomes full? In many chatbot systems, providers perform invisible operations to make space in the box and to keep the experience feeling seamless. They might remove older messages, summarise earlier parts of the conversation, truncate sections in the middle, or simply stop the chat and ask you to start a new session. Anthropic, for example, [describes this openly](https://support.claude.com/en/articles/8606394-how-large-is-the-context-window-on-paid-claude-plans): when a conversation approaches the limit, Claude automatically summarises earlier messages to make room for new content. In fact, in open source software such as LMStudio, you can control this behaviour directly.

![LMStudio context overflow settings](/assets/img/contextwindowoverflow.png){: .shadow }
_LMStudio lets you choose what happens when the context window overflows._

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=4" loading="lazy" title="Scene 4: Compaction strategies" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

When this kind of invisible compaction happens, the chatbot is no longer operating on the full conversation you think it is.

## Hidden instructions

It is not just your visible messages that consume space in the context window. Behind the scenes, chatbot systems often include additional hidden instructions, such as root prompts, system prompts, or developer prompts. OpenAI, for example, [describes these layers of authority](https://model-spec.openai.com/2025-12-18.html#levels_of_authority) in its model spec. These hidden messages also occupy space inside the box. In other words, the context window is already partially filled before you even begin typing.

How much space do they take? Anthropic [publishes its system prompts](https://platform.claude.com/docs/en/release-notes/system-prompts) openly, and a community repository of [leaked system prompts](https://github.com/jujumilk3/leaked-system-prompts) from other providers shows that some of these can be surprisingly long.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=5" loading="lazy" title="Scene 5: Hidden instructions" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

As of 2024, many chatbot systems have introduced long-term memory features, including [ChatGPT](https://openai.com/index/memory-and-new-controls-for-chatgpt/), [Claude](https://www.anthropic.com/news/memory), and [Gemini](https://blog.google/products/gemini/temporary-chats-privacy-controls/). These allow previous conversations or stored user information to influence responses. But those pieces of information also have to be inserted into the context window during generation. In fact, when memory is enabled, the box already starts with this information inside it.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=6" loading="lazy" title="Scene 6: Long-term memory" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

## Uploading documents

Often, a document is far larger than the context window itself. So providers use additional techniques to create the appearance that the chatbot is reading the entire document.

In reality, only small portions of the document are placed into the context window at any given time. Other parts may be stored in systems like vector databases, and pieces are retrieved when they appear relevant to your prompt. From the user's perspective, it can look like the model is analysing the entire document, but it is often operating on selected fragments.

OpenAI offers a rare glimpse into how this works. In its [documentation for ChatGPT Enterprise](https://help.openai.com/en/articles/10029836-optimizing-file-uploads-in-chatgpt-enterprise#h_049d7e8da3), it explains that if a single document exceeds 110k tokens, only the first 110k are included in the context window. If multiple documents are uploaded and their combined total exceeds that limit, tokens are divided among them using a proportional allocation strategy. Anything left over is sent to a search index and retrieved only when it appears relevant to your prompt.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=7" loading="lazy" title="Scene 7: Document uploads" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

Put all of this together on a real subscription tier and the maths gets uncomfortable. Hidden instructions, memory, a document, and a couple of exchanges can fill a 32k context window (such as ChatGPT's Go and Plus tier) before the conversation really starts. Once that happens, compaction kicks in, and the data the model is operating on is no longer what you originally provided.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=8" loading="lazy" title="Scene 8: What's left" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

## Reasoning tokens

Another complication comes from reasoning tokens. Some models generate internal reasoning steps while producing an answer. These intermediate tokens can temporarily consume space in the context window as the model works through a problem. OpenAI [notes](https://developers.openai.com/api/docs/guides/reasoning) that depending on the problem's complexity, models may generate anywhere from a few hundred to tens of thousands of reasoning tokens, and that it is important to ensure there is enough space in the context window to accommodate them.

Exactly how providers manage these tokens, especially as they approach the limits of the context window, is not well documented. For example, if reasoning tokens temporarily consume space while you are reaching the limit of the context window, does a compaction operation occur? I do not know.

<iframe class="scene-embed" src="/assets/animations/scenes.html?n=9" loading="lazy" title="Scene 9: Reasoning tokens" style="width:100%;aspect-ratio:16/9;border:0;background:#08090d;border-radius:12px;margin:2rem 0;display:block;"></iframe>

## So where does that leave us?

Four years after the [rapid global adoption](https://openai.com/index/scaling-ai-for-everyone/) of these systems, there is still very limited transparency from providers about how they operate under the hood. This is surprising, because many of these companies publicly advocate for responsible AI use.

Yet to this day, there is still no clear user manual explaining how these systems manage context, memory, or internal reasoning. And when you ask support teams for clarification, the answer is often the same:

> Sorry, we cannot share that information because it is proprietary.

Which raises an important question. If society is expected to use these systems responsibly, shouldn't we also be given a clearer understanding of how they actually work?

<script>
(function () {
  var iframes = document.querySelectorAll('iframe.scene-embed');
  if (!iframes.length || !('IntersectionObserver' in window)) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      try {
        entry.target.contentWindow.postMessage({ type: 'start-scene' }, '*');
      } catch (e) {}
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  iframes.forEach(function (f) { observer.observe(f); });
})();
</script>
