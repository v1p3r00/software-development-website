---
title: "Embeddings: how does AI “know” that two texts mean similar things?"
description: "Embeddings turn meaning into vectors. Learn how semantic similarity and cosine similarity power search, recommendations and duplicate detection."
tags: [ai, embeddings, vectors, semantic-search, machine-learning]
date: 2026-10-23 08:00
image: /articles/embeddings-explained/share.jpg
---

## What does it mean for two texts to be similar?

Consider these two sentences:

> “How can I reset my forgotten password?”

and:

> “I can't remember my password. What should I do?”

They have very few words in common.

A basic keyword search might struggle to connect them. An AI-powered search system, however, can recognise that they are asking essentially the same thing.

But how does it do that?

One important part of the answer is **embeddings**.

An embedding is a numerical representation of data — such as text, images or other inputs — produced by a model. The resulting vector allows a system to compare pieces of data mathematically based on their learned representation. Sentence Transformers, for example, uses embeddings for semantic similarity, semantic search, clustering and paraphrase mining. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## An embedding turns text into numbers

A computer does not work with a sentence in quite the same way we do.

An embedding model turns it into a numerical vector.

A simplified example:

```text
“How can I change my password?”
        ↓
embedding
        ↓
[0.18, -0.42, 0.71, 0.09, ...]


“Where can I update my password?”
        ↓
embedding
        ↓
[0.20, -0.39, 0.69, 0.11, ...]
```

Real embeddings can have many dimensions, and the individual numbers usually do not have a simple human-readable interpretation such as “this number represents passwords”.

**The meaning is represented by the pattern across the vector as a whole.**

During training, an embedding model can learn representations in which semantically related pieces of text tend to occupy similar regions of the vector space.

---

## What is a vector?

“Vector” sounds like a very mathematical term, but the basic idea is straightforward.

Imagine a coordinate system.

A point could have two coordinates:

```text
A = (2, 3)
B = (5, 4)
C = (-2, 6)
```

You can place these points on a map.

Embeddings work with the same basic idea, except the representation does not have to be two- or three-dimensional.

A piece of text gets a position in a much higher-dimensional space.

```text
                 semantically similar texts
                         ● ●
                      ●
                   ●
                ●
        ●

                    ●

          ● ●
                 different topics
```

In a real system, we cannot simply draw this space because embeddings may contain many dimensions.

**The important idea is that relationships between pieces of text can be represented mathematically through distances, directions and similarity measures.**

---

## We are comparing meaning, not just words

This is one of the biggest differences between semantic search and traditional keyword search.

Imagine you run an online shop.

A customer searches for:

> “Comfortable shoes for long walks”

But the product page says:

> “Ergonomically designed footwear optimised for all-day use.”

The words are quite different.

The meaning is related.

A semantic search system can potentially recognise that relationship.

According to the Sentence Transformers documentation, semantic search can work with synonyms, abbreviations and misspellings rather than relying only on lexical matches. ([sbert.net](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html))

---

## How do we measure similarity?

Once two texts have been converted into vectors, we need a way to compare them.

One common approach is **cosine similarity**.

Rather than simply measuring how far apart two points are, cosine similarity looks at the angle between two vectors.

In simplified form:

```text
Vector A
      ↗
     /
    /

        ↗
       /
      /
     Vector B

small angle → similar direction
large angle → less similar direction
```

The mathematical definition is:

$$
\text{cosine similarity} =
\frac{A \cdot B}{\|A\|\|B\|}
$$

Sentence Transformers includes cosine similarity as one of its supported similarity functions and provides direct functions for calculating cosine similarity between embeddings. ([sbert.net](https://sbert.net/docs/package_reference/util/similarity.html))

---

## Why does direction matter?

Imagine two people walking in the same direction.

One walks 100 metres.

The other walks 10 kilometres.

Their distances travelled are very different, but their direction is the same.

Cosine similarity is based on a similar idea: **it focuses on how closely two vectors point in the same direction.**

That can be useful when comparing text because the relationship between the representations can matter more than their absolute numerical size.

---

## A similarity score is not a “meaning percentage”

It would be a mistake to assume:

> “0.9 means these texts are 90% identical in meaning.”

It does not work that way.

The meaning of a similarity score depends on things such as:

- the embedding model,
- the task,
- the similarity function,
- the data being compared.

For example, the Sentence Transformers documentation shows that semantically related sentences can receive much higher cosine similarity scores than unrelated sentences. But the score is not a universal percentage of semantic equivalence. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html))

For a production system, it is therefore useful to evaluate your own data and determine which similarity thresholds actually work for your use case.

---

## Example 1: intelligent search

One of the most obvious applications is search.

Imagine an internal company knowledge base.

One document says:

> “Annual leave requests must be submitted at least five working days in advance.”

An employee asks:

> “How much notice do I need to give if I want a few days off?”

The two texts do not necessarily share many exact words.

With embeddings, the process can look like this:

```text
Documents
   ↓
embeddings
   ↓
vector database


User question
   ↓
query embedding
   ↓
similarity search
   ↓
most relevant documents
```

The system can therefore find information based on semantic relevance rather than exact keyword matching.

This is also one of the core building blocks of RAG systems.

---

## Example 2: product recommendations

Embeddings can also be useful for recommendations.

Imagine an online shop where each product has an embedding.

```text
Product A
“Waterproof hiking shoes for long trips”
        ↓
embedding


Product B
“Lightweight running shoes for road use”
        ↓
embedding


Product C
“Waterproof mountain boots for hiking”
        ↓
embedding
```

If the embedding of one product is close to another, that can be one signal that the products are semantically related.

You can then combine that signal with other information:

- price,
- category,
- stock,
- purchase history,
- ratings,
- customer preferences.

**An embedding is therefore not the entire recommendation system. It is one useful signal within it.**

---

## Example 3: detecting duplicates

Another practical use is finding duplicate or near-duplicate content.

For example, a customer-support system might contain:

```text
“I can't log into my account.”

“I can't sign in.”

“The system won't let me log in.”
```

The wording is different.

The meaning is very similar.

Embeddings can help identify texts that are close together in semantic space.

This can be useful for:

- finding repeated support questions,
- identifying duplicate knowledge-base articles,
- grouping similar product descriptions,
- clustering recurring support tickets.

Sentence Transformers lists paraphrase mining and semantic similarity among common embedding applications. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## What happens with a large database?

Suppose you have one million documents.

You do not want to compare a query embedding against every document one by one for every search.

This is why systems use vector indexes and specialised retrieval techniques.

A simplified workflow looks like this:

```text
1,000,000 documents
        ↓
embeddings
        ↓
vector index
        ↓
user question
        ↓
query embedding
        ↓
similarity search
        ↓
Top 10 results
```

Sentence Transformers provides semantic retrieval functions that use cosine similarity by default and can retrieve the highest-scoring results from a corpus. ([sbert.net](https://www.sbert.net/docs/package_reference/util/retrieval.html))

At larger scale, dedicated vector databases and vector-search infrastructure can be used to make this process efficient.

---

## The embedding model matters

There is no single embedding model that is perfect for every situation.

The best choice may differ for:

- general search,
- legal documents,
- product search,
- multilingual text,
- source code,
- images.

It also matters how queries and documents are encoded.

Sentence Transformers, for example, supports separate `encode_query` and `encode_document` methods for models that use different prompts or instructions for queries and documents. ([sbert.net](https://sbert.net/docs/sentence_transformer/usage/usage.html))

**A good embedding is therefore more than just a list of numbers. It is a representation designed to work well for a particular comparison or retrieval task.**

---

## An embedding model is not the same as an LLM

It is useful to separate these concepts.

An LLM is primarily designed to generate or transform content.

An embedding model turns an input into a vector that can then be used for comparison, search or clustering.

For example:

```text
Text
   ↓
Embedding model
   ↓
vector
   ↓
search / similarity / clustering
```

An LLM can then use the retrieved information.

This is exactly what happens in a typical RAG architecture:

```text
question
 ↓
embedding
 ↓
search
 ↓
relevant documents
 ↓
LLM
 ↓
answer
```

**The embedding is often part of the AI system's search layer rather than the component that writes the final answer.**

---

## There are limitations

Semantic similarity does not mean the system has understood a sentence in exactly the same way a human would.

An embedding model can make mistakes.

For example:

- two similarly worded texts can have different meanings,
- negation can be important,
- specialist terminology may be represented poorly,
- two statements about the same topic can actually contradict each other.

Consider:

> “The product supports offline use.”

and:

> “The product does not support offline use.”

The sentences are extremely similar in wording.

Their meaning is opposite.

**Semantic similarity is therefore not the same as logical equivalence.**

In production systems, embedding-based retrieval is often combined with additional ranking, rules or other models.

Sentence Transformers documents a two-stage retrieval approach in which an embedding-based retriever finds candidates and a Cross-Encoder can then re-rank the top results. ([sbert.net](https://www.sbert.net/docs/quickstart.html))

---

## Why does this matter in practice?

The idea behind embeddings is surprisingly simple and extremely useful:

**turn data into a mathematical representation in which meaningful relationships can be searched.**

From that basic idea, many different systems can be built:

```text
Embedding
   ↓
├── semantic search
├── RAG
├── recommendation systems
├── duplicate detection
├── document clustering
├── similar-case search
└── content discovery
```

That is why the word “embedding” appears so often in modern AI search systems.

---

## What does this mean for a business?

If you have thousands of products, documents, support tickets or internal knowledge-base entries, traditional keyword search may eventually become limiting.

Embeddings allow the system to look beyond **which words the user typed** and consider **which information has a similar meaning to the query**.

That is one of the main reasons AI-powered search can feel more natural than a traditional keyword search.

---

## Does AI really “understand” the text?

Embeddings are a good example of why AI systems do not always need to be described using human concepts.

The model does not necessarily “understand” a sentence in exactly the same way a person does.

It can instead learn a mathematical representation in which semantically related things tend to be positioned close together.

**From that relatively simple idea, we can build semantic search, recommendation systems, RAG pipelines and AI assistants that work with large collections of information.**

**softwaredevelopment.hu — AI solutions, intelligent search and custom software development for businesses.**

---

## Sources

- Sentence Transformers: [Quickstart](https://www.sbert.net/docs/quickstart.html)
- Sentence Transformers: [Semantic Textual Similarity](https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html)
- Sentence Transformers: [Semantic Search](https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html)
- Sentence Transformers: [Similarity Functions](https://sbert.net/docs/package_reference/util/similarity.html)
- Sentence Transformers: [Semantic Search Retrieval](https://www.sbert.net/docs/package_reference/util/retrieval.html)
- Sentence Transformers: [Usage and Query / Document Embeddings](https://sbert.net/docs/sentence_transformer/usage/usage.html)
