---
title: "Context windows and context engineering: what can an AI actually “see”?"
description: "What can an AI actually see? Learn how context windows, tokens, memory and context engineering shape what an AI application can use."
tags: [ai, context-window, context-engineering, llm, agents]
date: 2026-10-25 08:00
image: /articles/context-window-and-context-engineering/share.jpg
---

## What can an AI actually “see”?

When you talk to an AI assistant, it is easy to imagine that the model continuously sees everything you have ever told it.

The reality is more complicated.

When a language model generates a response, it works from the **context** available to it for that particular inference. That context can include system instructions, conversation history, documents, search results, tool outputs and other information supplied by the application.

Anthropic describes context as the tokens included when an LLM is sampling a response. Context engineering is then the process of selecting and maintaining the most useful information for that inference. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**An AI does not simply “see everything”. It sees what the application puts into its context at that point in time.**

---

## What is a context window?

A context window is the maximum amount of input a model can handle during a particular processing operation.

It is generally measured in **tokens**.

A token is not exactly the same thing as a word.

A token can be:

- a complete word,
- part of a word,
- punctuation,
- a number,
- or a short sequence of characters.

So when a model is described as having a context window of hundreds of thousands of tokens, you cannot simply convert that number directly into the same number of words or pages.

The exact capacity depends on the model and how it is being used. Anthropic currently documents 200K+ token API context for several models and up to 1M tokens for some models. ([support.anthropic.com](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window))

---

## Think of the context window as a workbench

A useful analogy is a workbench.

Imagine a technician working on a machine.

On the bench they might have:

- the instructions,
- the tools,
- the technical drawing,
- previous measurements,
- the parts they are working with.

They can work with what is on the bench.

If something is not there, they cannot directly use it.

An AI context window works in a similar way.

```text
                 CONTEXT WINDOW

┌─────────────────────────────────────┐
│ system instructions                │
│                                     │
│ conversation history               │
│                                     │
│ documents                           │
│                                     │
│ tool results                        │
│                                     │
│ user request                        │
└─────────────────────────────────────┘
                  ↓
                 LLM
                  ↓
                answer
```

The information in the context does not necessarily come from one place.

An AI application can assemble the context itself before calling the model.

That is where context engineering becomes important.

---

## Context window ≠ memory

This is an important distinction.

**Context** is the information available to the model during a particular inference.

**Memory** is information that an application may store separately and retrieve later.

A simplified architecture might look like this:

```text
Memory
   ↓
stored information
   ↓
retrieval
   ↓
Context
   ↓
LLM
   ↓
answer
```

An AI application might store:

- user preferences,
- summaries of previous conversations,
- project state,
- customer information,
- previous decisions.

But it does not necessarily need to send all of that information to the model for every question.

**Memory is more like external storage; context is the information selected for the current piece of work.**

---

## Why not just give the model everything?

At first glance, this sounds reasonable:

> “If the model has a very large context window, let's give it all the information.”

That is not necessarily a good idea.

Imagine an AI customer-service assistant with access to:

- 5,000 documents,
- 2,000 previous cases,
- 50,000 chat messages,
- the entire product database,
- every internal policy.

In theory, you can provide a huge amount of information.

In practice, another problem appears:

**more information does not automatically mean a better answer.**

The model still needs to identify which parts actually matter for the current question.

---

## The “Lost in the Middle” problem

Research has shown that models do not always make equally effective use of every part of a long context.

The paper *Lost in the Middle* examined how language models use long contexts and found that performance can depend on where the relevant information appears. In many of the tested settings, performance was better when relevant information appeared near the beginning or end of the context, and worse when it appeared in the middle. ([arxiv.org](https://arxiv.org/abs/2307.03172))

A simplified illustration:

```text
CONTEXT

[ IMPORTANT ]
[ data ]
[ data ]
[ data ]
[ data ]
[ IMPORTANT INFORMATION ]
[ data ]
[ data ]
[ data ]
[ IMPORTANT ]

↑ potentially easier to retrieve
            ↓
       may be harder
       in the middle
```

This does not mean every modern model always “forgets” information in the middle.

The effect depends on the model, task and context.

The important lesson is:

**it is not enough for a model to accept a large amount of information; it also needs to use that information effectively.**

---

## A larger context window does not solve everything

Context windows have become dramatically larger.

That is useful.

A larger window can allow an application to:

- process longer documents,
- retain more conversation history,
- inspect larger codebases,
- include more tool results,
- support longer workflows.

But a larger window does not automatically solve the relevance problem.

Anthropic's own context-engineering guidance notes that even very large context windows can still be affected by context pollution and information-relevance issues. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

**The goal is not to put as much information as possible into the context. The goal is to put the right information into it.**

---

## This is where context engineering comes in

Prompt engineering traditionally focused on a question like:

> “How should we write the prompt?”

Context engineering is broader.

The question becomes:

> “What information should the model receive at this moment to produce the desired result?”

Anthropic describes context engineering as a natural progression from prompt engineering. It includes managing system instructions, tools, MCP, external data and conversation history. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

An AI application therefore does not have to be just a prompt.

It can be a complete system that assembles the appropriate context before every model call.

---

## How do you build good context?

Imagine a business AI assistant responding to a customer complaint.

The system may need:

```text
System instructions
        +
customer information
        +
current conversation
        +
relevant company policy
        +
relevant product information
        +
previous case summary
        +
available tools
        ↓
      CONTEXT
        ↓
       LLM
        ↓
      answer
```

It probably does not need:

- every company document,
- every previous customer conversation,
- every product specification,
- every tool description.

**Context engineering is about selection.**

---

## Step 1: define the task

Good context design starts not with:

> “What can we send to the model?”

but with:

> “What does the model actually need to accomplish?”

For example:

```text
Task:
“Answer the customer's warranty question.”
```

The model may need:

- the relevant product,
- purchase date,
- warranty policy,
- current customer message.

Most other company information is probably irrelevant.

---

## Step 2: retrieve relevant information

This is where context engineering connects directly to RAG.

```text
User question
        ↓
retrieval
        ↓
relevant documents
        ↓
context
        ↓
LLM
```

Instead of sending the entire knowledge base, the application first retrieves the relevant parts.

Retrieval might use:

- vector search,
- keyword search,
- hybrid search,
- database queries,
- API calls,
- or combinations of these.

Anthropic's Contextual Retrieval approach is specifically designed to improve the retrieval stage so that relevant information is more reliably placed into the model's context. ([anthropic.com](https://www.anthropic.com/engineering/contextual-retrieval))

---

## Step 3: add structured state

For an AI agent, context is not limited to documents.

It may also contain structured state:

```text
TASK
Current goal:
Prepare the customer response.

STATE
Customer verified: yes
Order found: yes
Refund eligible: yes

AVAILABLE TOOLS
- get_order
- issue_refund
- send_email

RELEVANT DATA
Order #18452
Product: ...
Purchase date: ...
```

This can be much more useful than a long, unstructured block of text.

**Well-structured context helps the model understand what matters, what has already happened and what still needs to be done.**

---

## Step 4: don't repeat everything unnecessarily

Long conversations can accumulate a lot of repeated information.

For example:

```text
User:
“The project is being developed in London.”

Assistant:
“Understood, the project is being developed in London.”

User:
“Yes, and the deadline is December.”

Assistant:
“Understood, the project is being developed in London,
with a December deadline.”
```

Continue this for hundreds of messages and the context grows rapidly.

An agent system can therefore use:

- summaries,
- compact state,
- structured notes,
- relevance-based retrieval.

Anthropic describes techniques such as **compaction** and structured note-taking for long-running agents. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

---

## Memory can effectively be another database

A more sophisticated AI application may separate several layers:

```text
                 ┌───────────────┐
                 │   Database    │
                 │ users / data  │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Memory     │
                 │ summaries /   │
                 │ preferences   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │   Retrieval   │
                 └───────┬───────┘
                         ↓
                 ┌───────────────┐
                 │    Context    │
                 └───────┬───────┘
                         ↓
                        LLM
```

This is much more scalable than sending all stored information with every request.

---

## Tools are part of the context too

An AI agent does not only receive text.

It can also have tools available.

For example:

```text
User asks:
“When will my order arrive?”

        ↓

AI context
        ↓
available tool:
get_order_status
        ↓
tool result
        ↓
context update
        ↓
LLM
        ↓
answer
```

The tool result can therefore become new information in the next inference context.

This means context engineering is not only about writing prompts.

You also need to decide:

- which tools are available,
- when they should be used,
- what their results contain,
- how much information they return,
- how those results are structured.

---

## Too many tools can also become a problem

The same principle applies to tools.

Giving an agent 100 different tools does not necessarily make it more capable.

The model has to understand:

- what each tool does,
- when to use it,
- which parameters it expects,
- what its output means.

A well-designed agent may therefore expose only the tools relevant to the current task.

**Context is not just data. The available actions and their descriptions are also part of what the model can “see”.**

---

## A good context is often shorter

This sounds counterintuitive.

If more information is available, why not give the model all of it?

Because the proportion of relevant information matters.

Compare:

```text
A:
100 pages
95 pages irrelevant
5 pages important

B:
12 pages
10 pages important
2 pages background
```

The second context may be far more useful.

Research into long-context behaviour shows that both the amount and position of information can affect model performance. ([arxiv.org](https://arxiv.org/abs/2307.03172))

**One goal of context engineering is therefore to reduce information noise.**

---

## Structure matters as well as quantity

The same information can be easier or harder to use depending on how it is presented.

For example:

```text
Customer is John.
Order is 18452.
It was bought on 12 May.
The product is X.
The customer wants a refund.
Refund policy says ...
```

This may work.

But a structured representation is clearer:

```text
CUSTOMER
name: John

ORDER
id: 18452
product: X
purchase_date: 12 May

REQUEST
type: refund

POLICY
...
```

Anthropic's long-context prompting guidance recommends structured document markup such as XML tags when working with multiple documents, making documents and their metadata easier for the model to distinguish. ([docs.anthropic.com](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables))

---

## What should be in the context?

A practical checklist:

```text
[✓] current task
[✓] relevant instructions
[✓] required user data
[✓] relevant documents
[✓] current state
[✓] required tools
[✓] tool results
[✓] previous decisions / summary

[✗] irrelevant documents
[✗] outdated information
[✗] duplicate information
[✗] unnecessary tools
[✗] the entire database
```

The exact answer depends on the application.

But the mindset is important:

**do not ask “What can we send?” Ask “What does the model need?”**

---

## Context engineering in a real AI application

Imagine an AI assistant handling a support ticket.

The system might do this:

```text
1. User asks a question
          ↓
2. Identify the customer
          ↓
3. Retrieve the relevant order
          ↓
4. Find relevant documentation
          ↓
5. Check permissions
          ↓
6. Assemble the context
          ↓
7. LLM responds
          ↓
8. Use a tool if necessary
          ↓
9. Add the result back to context
```

This is much more than writing a clever prompt.

It is **context engineering**.

---

## What happens with long-running tasks?

An agent might work on a task for hours.

A single context window is still finite.

So long-running systems may need to:

- summarise previous work,
- save state,
- start a new context window,
- restore the important information.

Anthropic describes techniques such as compaction, structured note-taking and multiple context windows for long-running agent workflows. ([anthropic.com](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents))

In simplified form:

```text
Context 1
   ↓
work
   ↓
summary / state
   ↓
Context 2
   ↓
continue
   ↓
summary / state
   ↓
Context 3
```

**Long-term memory is therefore often not one enormous context window. It is state managed across multiple contexts.**

---

## Context is becoming a core part of AI application design

An LLM is only one component of a modern AI system.

Just as important are:

- what data it receives,
- when it receives it,
- in what order,
- what is deliberately excluded,
- what is retrieved,
- what is stored as memory,
- which tools are available.

```text
                 AI APPLICATION

Data ────────┐
Memory ──────┤
RAG ─────────┤
Tools ───────┼──→ Context → LLM → Output
History ─────┤
State ───────┤
Instructions ┘
```

**A strong AI application is not simply built around a strong model. The model and the context assembled for it together determine what the application can actually accomplish.**

---

## So what can an AI actually “see”?

It does not automatically see your entire company database.

It does not automatically have every previous conversation.

It does not necessarily see every document you have ever uploaded.

And it may not use every part of a long context equally well.

**It sees the information that the application places inside its context window for that particular inference.**

That is why an increasingly important question in AI development is no longer just:

> “Which model should we use?”

It is also:

> “What context should we give it so that it actually has the information it needs?”

---

## Good AI does not see everything – it sees the right things

When building an AI application, context-window size is an important technical parameter, but it is not a strategy by itself.

The real challenge is designing a system that can select, compress, structure and update the information the model needs.

**Context engineering is not about giving an AI as much information as possible. It is about giving it the right information at the right moment.**

**softwaredevelopment.hu — AI solutions, automation and intelligent applications for businesses.**

---

## Sources

- Anthropic: [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- Anthropic: [Contextual Retrieval](https://www.anthropic.com/engineering/contextual-retrieval)
- Anthropic: [Prompting Claude's long context window](https://www.anthropic.com/research/prompting-long-context)
- Anthropic Documentation: [Prompting best practices](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables)
- Anthropic Help Center: [How large is the Anthropic API's context window?](https://support.anthropic.com/en/articles/8606395-how-large-is-the-anthropic-api-s-context-window)
- Liu et al.: [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
- Anthropic: [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
