---
title: "LLMs explained: how does a large language model actually work?"
description: "A practical explanation of tokens, training, inference, context windows, temperature and hallucinations without the usual AI jargon."
tags: [ai, llm, machine-learning, chatbots, technology]
date: 2026-10-18 08:00
image: /articles/llms-explained/share.jpg
---

## What actually happens when you ask an AI a question?

You type something like “Write a short introduction for my company” into an AI chatbot, and within seconds you get a polished answer.

It can feel as though there is a very fast person sitting behind the screen, reading your request, thinking about it and writing a response.

That is not really what is happening.

A Large Language Model, or LLM, processes text as numerical representations, learns statistical patterns from very large collections of training data, and then generates a response one token at a time.

Google's Machine Learning Crash Course describes language models as systems that estimate the probability of tokens or sequences of tokens occurring within a longer sequence. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

That sounds complicated, but there is a useful everyday analogy.

> **An LLM is an extremely sophisticated text prediction system that has learned enough patterns to perform a surprisingly wide range of language tasks.**

---

## 1. An LLM does not actually see words

One of the first things worth understanding is that an LLM does not necessarily process complete words.

Before your text reaches the model, it is passed through a tokenizer. The tokenizer breaks the text into smaller units called tokens.

A token might be:

- a complete word,
- part of a word,
- punctuation,
- or, depending on the tokenizer, a smaller character-level unit.

Modern language models commonly use subword tokenisation. For example, the English word:

`unwatched`

might be represented as:

`un` + `watch` + `ed`

The exact result depends on the model and its tokenizer. Hugging Face documents several common approaches, including BPE, Unigram and WordPiece. ([Hugging Face](https://huggingface.co/docs/transformers/tokenizer_summary))

The same principle matters for other languages too. A long or unusual word may be split into several tokens rather than treated as one unit.

Eventually, those tokens are mapped to numerical IDs that the model can process.

In simplified form:

```text
"Build me a website"
        ↓
tokenisation
        ↓
[token 1] [token 2] [token 3] ...
        ↓
numbers
        ↓
LLM
```text

**The model is therefore not directly reading your sentence in the way a human does. It is processing a numerical representation of it.**

This matters in practice because different models can use different tokenisation schemes. The same piece of text can therefore consume different numbers of tokens depending on the model.

---

## 2. How does a model learn language?

This is where things become more interesting.

How does a system that ultimately works with numbers learn to write natural language, answer questions or generate code?

At the most basic level, a language model is trained on huge amounts of text and learns to predict what comes next.

For a causal language model, such as the architecture used by GPT-style models, the model predicts the next token based on the tokens that came before it. Hugging Face describes causal language modelling as predicting the next token from the preceding context. ([Hugging Face](https://huggingface.co/docs/course/chapter1/5))

For example:

```text
"The company is launching its new website next"
                                      ↓
                              likely next token?
                                      ↓
                                    "week"
```text

The model performs this kind of prediction over and over again during training.

When its prediction is wrong, the training process calculates an error and adjusts the model's internal parameters.

Over an enormous number of training examples, the model gradually becomes better at predicting language.

It is important not to imagine this as someone manually teaching it grammar rules.

Nobody needs to tell the model:

“Here is a noun.”

“Here is a verb.”

“This word belongs with that word.”

Instead, many of these relationships emerge from the statistical patterns learned during training.

---

## 3. What is a Transformer?

Modern LLMs are commonly based on the Transformer architecture.

The Transformer was introduced in the 2017 research paper “Attention Is All You Need”. Its central idea included an attention mechanism that allows the model to process relationships between different parts of a sequence. ([arXiv](https://arxiv.org/abs/1706.03762))

Why does that matter?

Consider this sentence:

> “The company contacted the developer because they built the new online shop.”

To interpret “they”, the surrounding context matters.

The model needs to consider relationships between different tokens rather than treating every word as an isolated item.

Attention provides a mathematical mechanism for doing this.

It is not human attention. The model is not literally “looking” at a word and thinking about it.

Instead, the architecture calculates relationships between representations of tokens and uses those relationships during processing.

**This ability to model relationships across a sequence is one of the foundations of modern LLMs.**

---

## 4. Training and inference are different things

There is an important distinction between training a model and using one.

During training, the model's parameters are updated.

When you ask a chatbot a question, however, the model is normally not learning that information by changing its parameters on the spot. It is using the parameters it already has to generate an answer.

This is called inference.

A simplified version looks like this:

```text
your question
     ↓
tokenisation
     ↓
tokens + context
     ↓
Transformer model
     ↓
probabilities for next token
     ↓
one token selected
     ↓
probabilities for next token
     ↓
...
     ↓
final response
```text

Hugging Face's Transformers documentation demonstrates the same basic pattern: text is tokenised, passed through a model, new token IDs are generated, and those IDs are decoded back into text. ([Hugging Face](https://huggingface.co/docs/transformers/quicktour))

**The answer is therefore not usually produced as one giant block. The model generates it progressively, token by token.**

That distinction becomes useful when trying to understand concepts such as temperature, context windows and hallucinations.

---

## 5. What is a context window?

Imagine that you are working on a large project with a pile of documents on your desk.

The more space you have, the more of those documents you can keep in front of you at the same time.

A model's context window is somewhat similar.

It defines how much tokenised information can be included in the context available to the model for a particular processing task.

That context might include:

- your current question,
- previous messages,
- system instructions,
- documents,
- retrieved company information,
- tool results,
- other relevant data.

For example:

```text
instructions
+
conversation history
+
company documents
+
customer information
+
current question
        ↓
   context window
        ↓
       LLM
```text

Google's LLM material explains the importance of context for language-model predictions, while modern generative AI systems support increasingly large context windows. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

A larger context window does not automatically mean that a model is more intelligent.

It means that more information can potentially be supplied to it in a single interaction.

That can be extremely useful for business applications.

An internal company assistant, for example, might need to work with:

- product documentation,
- customer support procedures,
- internal policies,
- previous conversation history,
- and the user's current question.

But there is an important distinction:

**Being able to place information into the context does not guarantee that the model will use every piece of it correctly.**

---

## 6. What does temperature actually do?

Temperature is another term that is often misunderstood.

It does not mean that you are telling the model to “think harder”.

During generation, the model assigns probabilities to possible next tokens. Temperature influences how those probabilities are used when selecting the next token.

Lower temperatures generally make generation more predictable and focused.

Higher temperatures can produce more varied and creative results. Google's Vertex AI documentation describes temperature as a sampling parameter that controls the degree of randomness in token selection. ([Google Cloud](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters))

A simple way to think about it is:

**Lower temperature:** “Prefer the most likely option.”

**Higher temperature:** “Allow less likely options to be selected more often.”

This can make sense for creative writing, brainstorming or generating alternative ideas.

For a structured business task, you may want more predictable output.

However, temperature is not a magic “accuracy” setting.

Reducing it does not turn an LLM into a fact-checking database.

---

## 7. Why do LLMs hallucinate?

This is arguably the most important limitation to understand.

An LLM can produce an answer that sounds completely convincing while being factually wrong.

This is usually called a hallucination.

OpenAI's 2025 research on hallucinations describes them as plausible but false statements generated by language models. The research also discusses how common training and evaluation practices can encourage models to guess rather than acknowledge uncertainty. ([OpenAI](https://openai.com/index/why-language-models-hallucinate/))

Why does this happen?

Because an LLM is not fundamentally an authoritative database of facts.

Suppose you ask:

> “Who founded the fictional company Example Ltd in 1987?”

The model may have no reliable information about such a company.

But language patterns may still suggest that a person's name would be a plausible continuation of the question.

The model can therefore generate a fluent answer even when the underlying fact is unavailable.

This leads to one of the most important rules for using AI:

**A confident answer is not necessarily a verified answer.**

This distinction matters enormously in business.

An incorrect product specification might be inconvenient.

An incorrect legal, financial, medical or contractual claim can be much more serious.

That is why important AI-generated information should be checked against reliable sources or grounded in trusted business data.

---

## 8. So is an LLM just autocomplete?

In one sense, yes.

In another sense, that description is far too simplistic.

Predicting the next token is fundamental to how many modern language models are trained and used.

But the patterns learned through that process can become extremely rich.

The Google LLM course explains that by modelling statistical patterns in tokens, modern language models develop powerful internal representations that support tasks such as text generation, translation and summarisation. ([Google for Developers](https://developers.google.com/machine-learning/crash-course/llm))

So calling an LLM “autocomplete” is a little like saying:

“A car is basically a machine that turns its wheels.”

Technically true.

Not a very useful explanation of how the whole system works.

The next-token prediction mechanism is the foundation. The capabilities that emerge from training large Transformer models are much broader.

---

## 9. What does all this mean for a business?

If you run a small or medium-sized business, you do not need to understand every detail of Transformer mathematics.

But understanding the basics can help you avoid expensive misconceptions.

### AI does not automatically know what is true

If the information matters, verify it.

### Context matters

The quality and relevance of the information provided to a model can strongly affect the usefulness of its response.

### An LLM does not automatically know your business

If a model has no access to your CRM, documents, product database or internal systems, it cannot simply “know” those things because they exist somewhere inside your company.

### An LLM is only one part of an AI application

A useful business system may combine an LLM with your existing software and data.

For example:

```text
customer question
        ↓
AI assistant
        ↓
retrieve company information
        ↓
CRM / database / documents
        ↓
LLM
        ↓
answer or action
```text

**In many real business applications, the value comes less from the LLM itself and more from connecting the model to the right information and processes.**

That is also why two companies using the same underlying model can end up with completely different AI systems.

One might simply use it as a writing assistant.

Another might connect it to a CRM, product catalogue, internal documentation and customer-support workflow.

The underlying model is only one component.

---

## 10. The five things worth remembering

If you forget everything else in this article, remember these five points:

- **Tokens are the units of text that a language model processes; they are not necessarily complete words.**
- **Training teaches a model statistical patterns through large amounts of data and repeated optimisation.**
- **Inference is the process of using the trained model to generate an answer.**
- **The context window determines how much information can be supplied as context for a particular interaction.**
- **A fluent, confident response can still be factually wrong.**

Once these concepts make sense, other AI terms become much easier to understand.

Embeddings, RAG, AI agents, function calling and tool use are not isolated pieces of magic. They are additional mechanisms that can be built around language models to make them more useful in real applications.

---

## What could an LLM actually do for your business?

Not every business problem needs an AI model.

Sometimes a normal automation is the better solution. Sometimes an existing LLM API is enough. In other cases, the real opportunity is an AI assistant connected to your company's own data and systems.

The useful question is therefore not simply “Where can we put AI?”

It is:

> **“Which business problem would become genuinely easier, faster or more reliable with an AI system?”**

**softwaredevelopment.hu — If you want to explore where AI could realistically fit into your business, start with the problem rather than the technology.**

---

## Sources

- Google for Developers: [Introduction to Large Language Models](https://developers.google.com/machine-learning/crash-course/llm)
- Hugging Face: [How 🤗 Transformers solve tasks](https://huggingface.co/docs/course/chapter1/5)
- Hugging Face: [Tokenization algorithms](https://huggingface.co/docs/transformers/tokenizer_summary)
- Hugging Face: [Quicktour](https://huggingface.co/docs/transformers/quicktour)
- Google Cloud: [Content generation parameters](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/content-generation-parameters)
- OpenAI: [Why language models hallucinate](https://openai.com/index/why-language-models-hallucinate/)
- Vaswani et al.: [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
