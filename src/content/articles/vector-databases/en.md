---
title: "Vector databases: why is a traditional SQL database not enough for AI?"
description: "What does a vector database do that traditional SQL does not? Learn about vector search, filtering, hybrid search and pgvector."
tags: [ai, vectordatabase, vectors, postgresql, semantic-search]
date: 2026-10-24 08:00
image: /articles/vector-databases/share.jpg
---

## Why would AI need a different kind of database?

A traditional database is excellent at answering questions such as:

- Which customer has this email address?
- Which products cost less than £500?
- Which orders were created yesterday?
- Which users are active?

SQL is extremely good at this kind of problem.

But what happens if you ask:

> “Find products similar to this pair of shoes, but more suitable for long hiking trips.”

You are no longer looking for an exact field value.

You are looking for **semantic similarity**.

A vector database is designed for this type of problem. It stores vectors and makes it possible to search for the vectors that are closest to a query vector. Qdrant, for example, describes this as similarity search or nearest-neighbour search. ([qdrant.tech](https://qdrant.tech/documentation/search/search/))

---

## Traditional SQL is designed for a different kind of question

Imagine a conventional database table:

```text
products

id | name              | category | price
---|-------------------|----------|-------
1  | Trail Runner      | shoes    | 450
2  | Mountain Boot     | shoes    | 680
3  | Road Runner       | shoes    | 390
```text

You can ask:

```sql
SELECT *
FROM products
WHERE category = 'shoes'
AND price < 500;
```text

That is precise.

The database knows exactly what these conditions mean:

- `category = shoes`
- `price < 500`

But what if you ask:

> “Which shoe is most similar to this product description?”

There is no obvious `WHERE` condition for that.

You are not looking for one exact value.

You want the system to **rank records according to semantic similarity**.

---

## AI turns text into vectors

As we saw in the previous article, an embedding model can turn text into a numerical vector.

For example:

```text
“Waterproof hiking shoe for long mountain trips”
          ↓
[0.12, -0.44, 0.81, 0.17, ...]
```text

That vector can be stored in a database.

If another product has a similar embedding, the system can consider the two products semantically close.

```text
Product A
      ●

          ●
       Product B

                  ●
              Product C
```text

A vector database is therefore not simply a place to store a lot of numbers.

**Its important feature is the ability to search those vectors efficiently for similarity.**

---

## What is vector search?

Vector search starts with a query vector and looks for the closest stored vectors.

In simplified form:

```text
User question
        ↓
embedding
        ↓
query vector
        ↓
vector search
        ↓
nearest vectors
        ↓
relevant documents
```text

If you search an internal knowledge base for:

> “How can I request remote working?”

the system does not necessarily have to look for the exact phrase “remote working”.

It can also retrieve documents whose meaning is semantically related.

This is one of the fundamental building blocks of RAG.

---

## Why not just use SQL?

In fact, **sometimes you can**.

This distinction is important.

The question is not:

> “SQL or vector database?”

It is:

> “What kind of search problem are we solving?”

PostgreSQL already includes full-text search capabilities for finding natural-language documents and ranking them by relevance. ([postgresql.org](https://www.postgresql.org/docs/current/textsearch-intro.html))

And if you are already using PostgreSQL, the `pgvector` extension can add vector similarity search to the same database.

---

## pgvector: when PostgreSQL becomes a vector database too

**pgvector** is an open-source PostgreSQL extension for vector similarity search.

It supports, among other things:

- exact nearest-neighbour search,
- approximate nearest-neighbour search,
- cosine distance,
- inner product,
- L2 distance,
- HNSW indexes,
- IVFFlat indexes,
- SQL-based filtering. ([github.com](https://github.com/pgvector/pgvector))

This means you can have a PostgreSQL table containing:

```text
id
title
content
category
created_at
embedding
```text

Your conventional data and embeddings can live in the same database.

That can be extremely practical.

---

## Why is this useful in an existing PostgreSQL application?

Suppose you already have a Spring Boot + PostgreSQL application.

It contains:

```text
customers
products
orders
documents
users
permissions
```text

Now you want to add AI-powered document search.

You do not necessarily need to introduce a completely new database.

With `pgvector`, you can store embeddings alongside your existing PostgreSQL data.

The architecture could look like this:

```text
Spring Boot
     ↓
PostgreSQL
     ├── relational data
     ├── metadata
     ├── documents
     └── embeddings
```text

One of pgvector's key advantages is precisely that vectors can live alongside the rest of your PostgreSQL data, while retaining PostgreSQL capabilities such as joins and ACID transactions. ([github.com](https://github.com/pgvector/pgvector))

---

## So why do dedicated vector databases exist?

If PostgreSQL + pgvector can perform vector search, why would anyone use a separate vector database?

Because larger or search-heavy systems can have different requirements.

A dedicated vector database is designed specifically around workloads such as:

- large numbers of embeddings,
- fast similarity search,
- complex metadata filtering,
- hybrid search,
- multiple vector representations,
- specialised indexing,
- high search throughput.

Qdrant, for example, is specifically designed as a vector search engine and supports dense and sparse vectors, filtering and multiple search strategies. ([qdrant.tech](https://qdrant.tech/documentation/search/search/)) ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

**A dedicated vector database does not exist because PostgreSQL is “bad”. It exists because some search problems benefit from specialised infrastructure.**

---

## Metadata is just as important as the vector

An AI search system does not only care about semantic similarity.

Imagine you ask:

> “What laptops would you recommend for software development under £1,000?”

Semantic search may find several similar laptops.

But you also want:

- price below £1,000,
- in stock,
- available in your market,
- in the correct category.

That is **metadata filtering**.

```text
semantic similarity
        +
category = laptop
        +
price < £1000
        +
in_stock = true
        ↓
relevant results
```text

Qdrant's documentation explicitly points out that semantic vectors cannot represent every business constraint, so metadata filters are needed for requirements such as price, stock and location. ([qdrant.tech](https://qdrant.tech/documentation/search/filtering/))

pgvector can combine vector similarity with ordinary SQL `WHERE` conditions. ([github.com](https://github.com/pgvector/pgvector))

---

## This combination is one of the most powerful parts

A useful AI search system often does not simply ask:

> “What is similar to this?”

It asks:

> “What is similar to this while also satisfying these constraints?”

For example:

```text
“Find a similar hiking shoe”

        ↓

semantic search

        +

category = hiking

        +

price < £150

        +

stock > 0

        ↓

final results
```text

**AI search does not replace conventional database logic. The two are often more useful together.**

---

## What is hybrid search?

Real-world search often needs more than semantic similarity.

Consider:

> “iPhone 17 Pro Max 256GB”

Here, exact textual matching is important.

Now consider:

> “phone with a good camera and long battery life”

Here, semantic meaning is much more important.

This is where **hybrid search** comes in.

It combines semantic and lexical search.

```text
                    Search
                       ↓
             ┌─────────┴─────────┐
             ↓                   ↓
       semantic search      keyword search
             ↓                   ↓
           meaning          exact terms
             └─────────┬─────────┘
                       ↓
                    ranking
                       ↓
                    results
```text

Qdrant documents hybrid search as a combination of dense and sparse retrieval, allowing semantic similarity and exact keyword matching to contribute to the result ranking. ([qdrant.tech](https://qdrant.tech/documentation/search/text-search/hybrid-search/))

This is particularly useful when some searches are conceptual while others contain exact identifiers.

---

## Why do exact keywords still matter?

Imagine searching developer documentation for:

> “Spring Boot 3.3.5”

Semantic search may find many Spring Boot documents.

But you may need **exactly version 3.3.5**.

The same applies to:

- product codes,
- ISBNs,
- error codes,
- customer IDs,
- API names,
- version numbers.

In these situations, classic keyword search can be extremely valuable.

So a good AI search system does not necessarily choose one approach over the other.

**It combines semantic and lexical search.**

---

## What does this look like inside a RAG system?

We can now connect the ideas from the previous articles.

```text
Documents
     ↓
chunking
     ↓
embedding
     ↓
vector database
     ↓
        ← user question
     ↓
query embedding
     ↓
semantic / hybrid search
     ↓
metadata filtering
     ↓
relevant document sections
     ↓
LLM
     ↓
answer
```text

This is why a vector database is not the AI itself in a typical RAG system.

**It is the retrieval layer that makes the knowledge base searchable.**

The LLM can then use the retrieved information to generate the final answer.

---

## When is a traditional SQL database enough?

Very often.

Suppose your online shop needs to answer:

> “Show me black shirts between £300 and £500.”

You do not necessarily need embeddings.

SQL is perfectly suited to the job:

```sql
SELECT *
FROM products
WHERE category = 'shirt'
  AND colour = 'black'
  AND price BETWEEN 300 AND 500;
```text

The same applies to:

- user management,
- orders,
- invoicing,
- inventory,
- permissions,
- transactions,
- reporting.

**If you are searching structured data with precise conditions, traditional SQL is often the simpler and better solution.**

Do not add a vector database simply because your application contains AI.

---

## When should you use pgvector?

PostgreSQL + pgvector can be a strong starting point when:

- you already use PostgreSQL,
- you are building a moderate-sized AI search system,
- embeddings are closely connected to relational data,
- you need SQL joins and filtering,
- you want to keep the infrastructure relatively simple.

For example:

```text
PostgreSQL
├── customers
├── products
├── documents
├── permissions
└── embeddings
```text

This can be a very convenient architecture for an existing business application.

pgvector supports both exact and approximate nearest-neighbour search, with HNSW and IVFFlat available for approximate indexing. ([github.com](https://github.com/pgvector/pgvector))

---

## When should you use a dedicated vector database?

A dedicated solution may make more sense when the retrieval layer becomes a substantial system in its own right.

For example:

```text
millions / billions of embeddings
          ↓
high search volume
          ↓
complex filtering
          ↓
hybrid search
          ↓
multiple retrieval strategies
          ↓
dedicated vector infrastructure
```text

Examples of dedicated vector databases include Qdrant, Pinecone, Weaviate and Milvus.

The choice should not be based simply on popularity.

Consider:

- how much data you have,
- required latency,
- filtering requirements,
- hybrid search requirements,
- tenant isolation,
- operational model,
- and how much infrastructure complexity you are willing to manage.

---

## You do not need a separate database for everything

A common mistake in AI projects is introducing new infrastructure too early.

You can easily end up with:

```text
PostgreSQL
     +
Redis
     +
Vector DB
     +
Search Engine
     +
LLM
     +
separate ingestion service
```text

while the actual project contains only a few tens of thousands of documents.

PostgreSQL + pgvector may be more than enough.

**Infrastructure complexity is also a cost.**

It is not just about server bills.

You also have:

- operations,
- monitoring,
- backups,
- security,
- deployments,
- troubleshooting,
- developer time.

That is why it is often sensible to start with the simplest architecture that genuinely solves the problem.

---

## A vector database does not magically understand AI data

There is another misconception worth clearing up.

A vector database does not understand your documents by itself.

The embedding model creates the representation that the vector database stores and searches.

```text
Document
    ↓
embedding model
    ↓
vector
    ↓
vector database
    ↓
similarity search
```text

If the embedding model produces a poor representation, the vector database can still very efficiently find the nearest poor representation.

**Good vector search depends on the embedding model, indexing strategy, filtering, and retrieval design as well as the database itself.**

---

## The key difference

If we had to summarise the distinction in one sentence:

**SQL primarily asks: “Which records satisfy these conditions?”**

**Vector search asks: “Which records are semantically similar to this?”**

Modern AI systems often combine both:

```text
SQL
→ exact data
→ constraints
→ permissions
→ joins

+

Vector search
→ semantic similarity
→ relevance
→ related content

+

LLM
→ natural-language response
```text

That is much closer to how a serious AI application should be designed.

---

## Does your project actually need a vector database?

If you are only working with structured business data, probably not.

If you are building natural-language search, RAG, document similarity, recommendations or semantic retrieval, it becomes worth considering.

**And if you already use PostgreSQL, pgvector is often a sensible first step before introducing a separate vector database.**

A good architecture does not become modern by containing as many AI components as possible.

**It becomes good by choosing the simplest technology that actually solves the search problem.**

**softwaredevelopment.hu — AI solutions, intelligent search and custom software development for businesses.**

---

## Sources

- pgvector: [Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
- PostgreSQL: [Introduction to Full Text Search](https://www.postgresql.org/docs/current/textsearch-intro.html)
- Qdrant: [Similarity Search](https://qdrant.tech/documentation/search/search/)
- Qdrant: [Filtering](https://qdrant.tech/documentation/search/filtering/)
- Qdrant: [Hybrid Search](https://qdrant.tech/documentation/search/text-search/hybrid-search/)
- Qdrant: [Hybrid and Multi-Stage Queries](https://qdrant.tech/documentation/search/hybrid-queries/)
````
