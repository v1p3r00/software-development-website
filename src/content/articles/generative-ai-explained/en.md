---
title: "Generative AI: how does a simple prompt become text, images, audio or code?"
description: "How does a prompt become text, an image, audio or code? A plain-English guide to generative AI, Transformers, diffusion models and their limits."
tags: [ai, generative-ai, transformers, diffusion, automation]
date: 2026-10-20 08:00
image: /articles/generative-ai-explained/share.jpg
---

## What does generative AI actually mean?

You type something into an AI tool such as:

> “Write a short introduction for my company, create an image to go with it, and then turn the idea into a simple HTML page.”

A few seconds later, you may have all three.

From the outside, this can look almost magical.

Underneath, however, several different technologies may be involved.

Generative AI is a broad term for AI systems that create new content. That content might be text, images, audio, video or computer code.

**There is no single “generative AI machine” that creates everything in exactly the same way. Different types of content can require different models and techniques.**

Transformers are particularly important for text and code generation. Diffusion models have become a major approach for image generation, and related generative techniques are also used for other types of media.

---

## First: what is a prompt?

A prompt is simply the instruction or input you give to the model.

It could be one sentence:

> “Write a short Facebook post about a new restaurant opening.”

Or something much more specific:

> “Write a 300-word About page for a bookkeeping firm in Budapest. Use a friendly tone, avoid technical jargon and include three subheadings.”

A prompt is not a magic spell.

**The model does not read your instruction in exactly the same way a human does. It converts the input into representations that the model can process, then generates an output based on those representations.**

For text generation, this commonly involves tokens. A causal language model predicts the next token based on the preceding tokens. Hugging Face describes this as a core mechanism behind text generation. ([Hugging Face](https://huggingface.co/docs/transformers/tasks/language_modeling))

In simplified form:

```text
prompt
  ↓
tokenisation
  ↓
model
  ↓
next token
  ↓
next token
  ↓
...
  ↓
finished text
```

---

## Why are Transformers so important?

The Transformer architecture was introduced in the 2017 paper “Attention Is All You Need”. A central part of the architecture is the attention mechanism, which allows the model to represent relationships between different parts of a sequence. ([arXiv](https://arxiv.org/abs/1706.03762))

You do not need to understand the mathematics to understand the basic idea.

Consider this sentence:

> “The company launched a new website because the old one no longer met its customers' expectations.”

If someone asks what “the old one” refers to, you use the surrounding context.

A Transformer can similarly model relationships between different tokens in a sequence.

It is not literally “paying attention” like a person.

Instead, it uses mathematical operations to calculate how different representations relate to one another during processing.

That is one of the foundations of modern language models.

---

## How does a Transformer produce text?

Suppose you type:

> “Write a short introduction for a web development company in Budapest.”

The model does not normally retrieve a finished introduction from a database.

A text-generation model produces the response progressively, token by token.

Simplified:

```text
"Budapest"
      ↓
"Budapest web"
      ↓
"Budapest web development"
      ↓
"Budapest web development company"
      ↓
...
```

At each step, there are multiple possible next tokens.

Different generation strategies can make the output more deterministic or more varied. Hugging Face documents several generation and decoding strategies for language models. ([Hugging Face](https://huggingface.co/docs/transformers/main/en/generation_strategies))

**The finished paragraph therefore emerges progressively rather than appearing as one pre-written block inside the model.**

---

## So how does an image get generated?

Image generation works differently.

One of the most important approaches in modern image generation is the diffusion model.

The basic idea is surprisingly intuitive.

Imagine taking a clean photograph and repeatedly adding random noise until the original image becomes almost impossible to recognise.

A diffusion model learns the reverse direction.

It learns how to move from noise towards a coherent output.

```text
random noise
      ↓
less noise
      ↓
even less noise
      ↓
shapes
      ↓
details
      ↓
finished image
```

Hugging Face's Diffusers documentation describes diffusion models as systems that progressively denoise random noise to generate outputs such as images and audio. ([Hugging Face](https://huggingface.co/docs/diffusers/en/quicktour))

That is the basic idea behind the name “diffusion model”.

---

## But how does it know what to draw?

Random noise alone does not tell the model whether you want a red car, a Budapest office or a spaceship.

The model therefore needs conditioning information.

For example:

> “A modern minimalist office in Budapest, with large windows and natural light.”

The text is converted into a representation that can guide the image-generation process.

Hugging Face's Diffusers documentation explains that, in a typical text-to-image pipeline, a text encoder converts the prompt into embeddings that guide the denoising process. The diffusion model then progressively transforms the initial noise into the requested output. ([Hugging Face](https://huggingface.co/docs/diffusers/en/quicktour))

In simplified form:

```text
"modern Budapest office"
          ↓
     text embedding
          ↓
      noise + model
          ↓
     gradual denoising
          ↓
        image
```

This does not mean that the model “draws” the office in the same way a human designer would.

It generates the result based on patterns learned during training.

---

## What is an embedding?

An embedding is easiest to think of as a mathematical representation of information.

Words, phrases, images or other inputs can be represented in numerical spaces where relationships between concepts can be modelled.

For example, “dog” and “cat” are semantically related in ways that “dog” and “invoice” are not.

An embedding gives a machine a way to represent such relationships numerically.

This becomes particularly useful in generative AI because different components need a way to work with meaning rather than simply raw characters or individual pixels.

A text prompt can therefore be transformed into a representation that helps guide an image-generation process.

---

## What if you already have an image?

Generative AI does not have to start from a blank canvas.

Image-to-image systems can start with an existing image and transform it according to a prompt.

Hugging Face's documentation describes an image-to-image process in which an input image is encoded into a latent representation, noise is added, and the diffusion model then denoises it according to the prompt. ([Hugging Face](https://huggingface.co/docs/diffusers/main/api/pipelines/stable_diffusion/img2img))

That is why generative AI can be used for things such as:

- turning a rough sketch into a visual concept,
- changing the background of a product photo,
- creating alternative visual styles,
- modifying part of an image,
- developing early design concepts.

**Generative AI is therefore not only about creating content from nothing. It can also transform existing content.**

---

## How does audio generation work?

Audio is another category with its own technical challenges because sound changes continuously over time.

A speech-generation system, for example, can turn text into spoken audio.

A simplified workflow might look like this:

```text
text
 ↓
language processing
 ↓
speech representation
 ↓
audio generation
 ↓
sound
```

There are several approaches to generative audio, and they do not all use exactly the same architecture as image generation.

For example, the OpenAI API provides a speech-generation endpoint that takes text as input and produces audio. ([OpenAI](https://platform.openai.com/docs/api-reference/audio/voice-consent-list))

Hugging Face's Diffusers project also supports generative workflows for images, video and audio. ([Hugging Face](https://huggingface.co/docs/diffusers/main/index))

**Generative AI is therefore better understood as a family of technologies than as one specific algorithm.**

---

## Why can AI generate code?

Computer code has something in common with natural language: it is made up of sequences with strong patterns and rules.

For example:

```text
function
→ name
→ parameter
→ instruction
→ condition
→ result
```

Transformer-based language models can generate code when they have learned from suitable programming examples and tasks.

Hugging Face explicitly lists intelligent coding assistants among the applications of causal language models. ([Hugging Face](https://huggingface.co/docs/transformers/tasks/language_modeling))

That is why a request such as:

> “Write a JavaScript function that removes duplicate values from an array.”

can produce a useful piece of code.

The model has learned patterns connecting programming concepts, syntax and common implementations.

But there is an important distinction.

**Code generated by AI is not automatically correct simply because it looks convincing.**

It can contain logical errors, security problems, incorrect API usage or assumptions that do not fit your particular project.

---

## Generative AI is really several technologies

When we say “AI generates an image”, it is tempting to imagine one universal model doing everything.

The reality is closer to this:

```text
                 GENERATIVE AI
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
        text         image         audio
          ↓            ↓            ↓
     Transformer   diffusion     different
       models       models      generative models
          ↓            ↓            ↓
        code         video      speech / music
```

A single application can also combine several models.

A voice assistant might first use speech recognition to turn your voice into text, then a language model to understand and answer the request, and finally a speech-generation model to turn the answer back into audio.

So when you talk to an AI assistant, there may be several separate processing stages between your microphone and the final answer.

---

## Where can businesses actually use this?

The technology itself is not the business value.

The useful question is what process it can make faster, cheaper or easier.

### Text

Generative AI can help with:

- product descriptions,
- blog drafts,
- customer-service replies,
- internal summaries,
- first drafts of proposals,
- marketing ideas.

### Images

Possible applications include:

- campaign concepts,
- social media graphics,
- product presentations,
- website design concepts,
- moodboards,
- early visual concepts.

### Audio

Examples include:

- narration,
- internal training material,
- voice interfaces,
- spoken content,
- prototypes.

### Code

It can assist with:

- prototypes,
- repetitive coding tasks,
- documentation,
- test generation,
- debugging,
- code explanation.

**The strongest business use cases are usually not “let's do something with AI”. They are specific processes where unnecessary manual work can be reduced.**

---

## What are the limitations?

Generative AI can be impressive, but it is not infallible.

### 1. It does not guarantee truth

A language model can produce fluent but incorrect information.

Important business, legal, financial or technical information therefore needs appropriate verification.

### 2. Images are not automatically technically accurate

An image generator is not a CAD system.

If you need an engineering-accurate component, an attractive AI image is not a substitute for technical design.

### 3. Generated code needs testing

AI-generated code can work, but it can also be wrong or insecure.

It needs to be reviewed and tested like any other code.

### 4. Consistency can be difficult

A marketing campaign may require multiple images featuring exactly the same product, character or visual identity.

Maintaining perfect consistency across generated assets can be challenging.

### 5. Regulation matters

The EU AI Act contains specific provisions for general-purpose AI models and certain generative AI systems. According to the European Commission, obligations for providers of general-purpose AI models began applying in August 2025, while certain transparency requirements for AI systems apply from 2 August 2026. ([European Commission](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai), [European Commission](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems))

This can matter if your business publishes AI-generated content or builds AI systems for customers.

---

## The prompt is not the magic

Generative AI is often discussed as though everything comes down to finding the perfect prompt.

Prompts do matter.

But a real business system usually needs much more.

```text
good prompt
    ↓
appropriate model
    ↓
relevant company data
    ↓
well-designed workflow
    ↓
verification
    ↓
human decision
    ↓
business result
```

**Generative AI becomes much more useful when it is part of a well-designed process rather than a standalone magic box.**

For example, a customer-service system could combine a language model with your product catalogue, CRM and support documentation.

The model is only one component.

---

## A simple mental model for generative AI

If you want to keep the whole subject straight in your head, think about it like this:

**Text and code:** a language model processes tokens and progressively predicts the next tokens.

**Images:** a diffusion model starts with noise and progressively transforms it into a coherent image.

**Audio:** a generative system converts textual or other input into a representation from which audio can be produced, using the architecture chosen by the system.

**Video:** a generative system has to handle both spatial and temporal information so that the generated frames form coherent moving content.

And underneath all of them is the same broad principle:

> **The model is not creating content in the same way a human artist, writer or programmer does. It generates outputs from patterns learned during training.**

That distinction is important because it explains both the impressive capabilities and the limitations.

---

## Where could generative AI genuinely help your business?

Generative AI becomes interesting when it solves a specific problem.

Perhaps your customer-service team spends hours writing first-draft replies. Perhaps your product team needs hundreds of descriptions. Perhaps your developers repeatedly solve similar coding tasks. Or perhaps your marketing team needs to produce more visual concepts before deciding what is worth developing.

The best starting point is usually the workflow itself.

Look for the repetitive, time-consuming or expensive part first. Then decide whether generative AI is actually the right tool for that part of the process.

**softwaredevelopment.hu — If you want to identify where generative AI could have a real, measurable role in your business, start with the problem rather than the latest AI tool.**

---

## Sources

- Vaswani et al.: [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- Hugging Face: [Causal Language Modeling](https://huggingface.co/docs/transformers/tasks/language_modeling)
- Hugging Face: [Generation Strategies](https://huggingface.co/docs/transformers/main/en/generation_strategies)
- Hugging Face: [Diffusers Quickstart](https://huggingface.co/docs/diffusers/en/quicktour)
- Hugging Face: [Stable Diffusion Image-to-Image](https://huggingface.co/docs/diffusers/main/api/pipelines/stable_diffusion/img2img)
- Hugging Face: [Diffusers](https://huggingface.co/docs/diffusers/main/index)
- OpenAI: [Audio API Reference](https://platform.openai.com/docs/api-reference/audio/voice-consent-list)
- European Commission: [AI Act](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai)
- European Commission: [Quick Facts: Transparency Rules for AI Systems](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems)
